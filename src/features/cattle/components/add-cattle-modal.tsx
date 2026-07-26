"use client";

import { Form, Formik } from "formik";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Yup from "yup";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { PhotoUploadField } from "@/features/cattle/components/cattle-photo";
import { buildCattleFormData, useCattle } from "@/features/cattle/hooks/use-cattle";
import { husbandryApi } from "@/lib/api/services";

type PhotoSet = {
  photo_front: File | null;
  photo_left: File | null;
  photo_right: File | null;
};

function ageDaysFromDob(dob: string): number | null {
  if (!dob) return null;
  const born = new Date(dob);
  if (Number.isNaN(born.getTime())) return null;
  const today = new Date();
  const ms = today.getTime() - born.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function formatAge(days: number | null) {
  if (days == null) return null;
  if (days < 60) return `${days} days old`;
  const months = Math.floor(days / 30.4);
  if (months < 24) return `~${months} months old`;
  return `~${(days / 365).toFixed(1)} years old`;
}

const schema = Yup.object({
  tag_id: Yup.string().required("Tag ID is required"),
  name: Yup.string(),
  breed: Yup.string(),
  sex: Yup.mixed<"FEMALE" | "MALE">().oneOf(["FEMALE", "MALE"]).required(),
  date_of_birth: Yup.string(),
  notes: Yup.string(),
  is_pregnant: Yup.string(),
  insemination_date: Yup.string(),
  breeding_method: Yup.string(),
  previous_calvings: Yup.number().min(0).max(20),
  last_calving_date: Yup.string(),
});

export function AddCattleModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { create } = useCattle();
  const settings = useQuery({
    queryKey: ["husbandry", "settings"],
    queryFn: husbandryApi.settings,
    enabled: open,
  });

  const firstBreedingAge = Number(settings.data?.first_breeding_age_days ?? 450);
  const weaningDays = Number(settings.data?.weaning_days ?? 90);
  const gestationDays = Number(settings.data?.gestation_days ?? 280);

  const [photos, setPhotos] = useState<PhotoSet>({
    photo_front: null,
    photo_left: null,
    photo_right: null,
  });
  const [previews, setPreviews] = useState<Record<keyof PhotoSet, string | null>>({
    photo_front: null,
    photo_left: null,
    photo_right: null,
  });

  function resetPhotos() {
    setPhotos({ photo_front: null, photo_left: null, photo_right: null });
    setPreviews({ photo_front: null, photo_left: null, photo_right: null });
  }

  function setPhoto(key: keyof PhotoSet, file: File | null) {
    setPhotos((prev) => ({ ...prev, [key]: file }));
    setPreviews((prev) => ({
      ...prev,
      [key]: file ? URL.createObjectURL(file) : null,
    }));
  }

  function handleClose() {
    resetPhotos();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add animal" className="sm:max-w-xl">
      <Formik
        initialValues={{
          tag_id: "",
          name: "",
          breed: "",
          sex: "FEMALE" as const,
          date_of_birth: "",
          notes: "",
          is_pregnant: "",
          insemination_date: "",
          breeding_method: "AI",
          previous_calvings: 0,
          last_calving_date: "",
        }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          if (!photos.photo_front || !photos.photo_left || !photos.photo_right) {
            helpers.setStatus("Front, left, and right photos are all required.");
            return;
          }

          const age = ageDaysFromDob(values.date_of_birth);
          const breedingReady =
            values.sex === "FEMALE" && (age == null || age >= firstBreedingAge);

          if (breedingReady && values.is_pregnant === "") {
            helpers.setStatus("Please choose whether this animal is pregnant.");
            return;
          }
          if (values.is_pregnant === "true" && !values.insemination_date) {
            helpers.setStatus("Insemination / mating date is required when pregnant.");
            return;
          }

          try {
            const payload: Record<string, string | number | boolean | null | undefined> = {
              tag_id: values.tag_id,
              name: values.name,
              breed: values.breed,
              sex: values.sex,
              date_of_birth: values.date_of_birth || undefined,
              notes: values.notes,
              status: "ACTIVE",
            };

            if (breedingReady) {
              payload.is_pregnant = values.is_pregnant === "true";
              payload.previous_calvings = Number(values.previous_calvings) || 0;
              if (values.is_pregnant === "true") {
                payload.insemination_date = values.insemination_date;
                payload.breeding_method = values.breeding_method;
              }
              if (Number(values.previous_calvings) > 0 && values.last_calving_date) {
                payload.last_calving_date = values.last_calving_date;
              }
            }

            await create.mutateAsync(buildCattleFormData(payload, photos));
            handleClose();
          } catch (error) {
            helpers.setStatus(getMutationError(error).message);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, status }) => {
          const age = ageDaysFromDob(values.date_of_birth);
          const ageLabel = formatAge(age);
          const isFemale = values.sex === "FEMALE";
          const isCalf = isFemale && age != null && age < weaningDays;
          const breedingReady = isFemale && (age == null || age >= firstBreedingAge);
          const showRepro = breedingReady;
          const expectedCalving =
            values.is_pregnant === "true" && values.insemination_date
              ? (() => {
                  const d = new Date(values.insemination_date);
                  d.setDate(d.getDate() + gestationDays);
                  return d.toISOString().slice(0, 10);
                })()
              : null;

          const stageHint = !isFemale
            ? "Males skip pregnancy and calving history."
            : !values.date_of_birth
              ? "Add date of birth so we know if this is a calf, heifer, or cow."
              : isCalf
                ? "Calf — no pregnancy status needed."
                : age != null && age < firstBreedingAge
                  ? "Growing heifer — too young for breeding intake."
                  : "Breeding age — tell us pregnancy and calving history.";

          return (
            <Form className="space-y-4">
              <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">Photos (required)</p>
                <PhotoUploadField
                  label="Front"
                  preview={previews.photo_front}
                  required
                  onChange={(file) => setPhoto("photo_front", file)}
                />
                <PhotoUploadField
                  label="Left side"
                  preview={previews.photo_left}
                  required
                  onChange={(file) => setPhoto("photo_left", file)}
                />
                <PhotoUploadField
                  label="Right side"
                  preview={previews.photo_right}
                  required
                  onChange={(file) => setPhoto("photo_right", file)}
                />
              </div>

              <Input
                label="Tag ID"
                name="tag_id"
                value={values.tag_id}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.tag_id ? errors.tag_id : undefined}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label="Breed"
                  name="breed"
                  value={values.breed}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="Gender"
                  name="sex"
                  value={values.sex}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue("is_pregnant", "");
                    setFieldValue("insemination_date", "");
                    setFieldValue("previous_calvings", 0);
                    setFieldValue("last_calving_date", "");
                  }}
                  onBlur={handleBlur}
                  options={[
                    { label: "Female (default)", value: "FEMALE" },
                    { label: "Male", value: "MALE" },
                  ]}
                />
                <Input
                  label="Date of birth"
                  name="date_of_birth"
                  type="date"
                  value={values.date_of_birth}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue("is_pregnant", "");
                    setFieldValue("insemination_date", "");
                    setFieldValue("previous_calvings", 0);
                    setFieldValue("last_calving_date", "");
                  }}
                  onBlur={handleBlur}
                />
              </div>

              <div className="rounded-xl bg-primary/5 px-3.5 py-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  {ageLabel ? `Age: ${ageLabel}` : "Age: unknown (no DOB)"}
                </p>
                <p className="mt-1">{stageHint}</p>
              </div>

              {showRepro ? (
                <div className="space-y-3 rounded-xl border border-border p-3">
                  <p className="text-sm font-semibold">Reproduction</p>
                  <Select
                    label="Is she pregnant?"
                    name="is_pregnant"
                    value={values.is_pregnant}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={[
                      { label: "Select…", value: "" },
                      { label: "Yes — currently pregnant", value: "true" },
                      { label: "No — open / not pregnant", value: "false" },
                    ]}
                  />

                  {values.is_pregnant === "true" ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          label="Insemination / mating date"
                          name="insemination_date"
                          type="date"
                          value={values.insemination_date}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <Select
                          label="Method"
                          name="breeding_method"
                          value={values.breeding_method}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          options={[
                            { label: "Artificial Insemination", value: "AI" },
                            { label: "Natural service", value: "NATURAL" },
                          ]}
                        />
                      </div>
                      {expectedCalving ? (
                        <p className="text-xs text-muted-foreground">
                          Expected calving around <strong>{expectedCalving}</strong> (
                          {gestationDays}-day gestation).
                        </p>
                      ) : null}
                      <Input
                        label="Previous calves (before this pregnancy)"
                        name="previous_calvings"
                        type="number"
                        min={0}
                        max={20}
                        value={String(values.previous_calvings)}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </>
                  ) : null}

                  {values.is_pregnant === "false" ? (
                    <Input
                      label="Number of previous calvings"
                      name="previous_calvings"
                      type="number"
                      min={0}
                      max={20}
                      value={String(values.previous_calvings)}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  ) : null}

                  {Number(values.previous_calvings) > 0 ? (
                    <Input
                      label="Most recent calving date"
                      name="last_calving_date"
                      type="date"
                      value={values.last_calving_date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hint="Helps set lactation / voluntary waiting period correctly."
                    />
                  ) : null}
                </div>
              ) : null}

              <Textarea
                label="Notes"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={create.isPending}>
                Save animal
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
