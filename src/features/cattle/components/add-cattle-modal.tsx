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
import { useTranslation } from "@/lib/i18n";
import { PhotoUploadField } from "@/features/cattle/components/cattle-photo";
import { CattleSelect } from "@/features/cattle/components/cattle-select";
import { buildCattleFormData, useCattle, useCattleChoices } from "@/features/cattle/hooks/use-cattle";
import { husbandryApi } from "@/lib/api/services";
import { formatAge } from "@/lib/utils/format-age";

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
  has_calved: Yup.string(),
  last_calving_date: Yup.string(),
  mother_origin: Yup.string(),
  mother: Yup.string(),
  mother_external_id: Yup.string(),
  father_origin: Yup.string(),
  father: Yup.string(),
  father_external_id: Yup.string(),
  insemination_sire_origin: Yup.string(),
  insemination_sire: Yup.string(),
  insemination_sire_external_id: Yup.string(),
});

export function AddCattleModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { language, t } = useTranslation();
  const { create } = useCattle();
  const cattleChoices = useCattleChoices();
  const herd = cattleChoices.data?.results ?? [];
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
    <Modal open={open} onClose={handleClose} title={t("cattle.form.addAnimal")} className="sm:max-w-xl">
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
          has_calved: "",
          last_calving_date: "",
          mother_origin: "NONE", // NONE, INTERNAL, EXTERNAL
          mother: "",
          mother_external_id: "",
          father_origin: "NONE", // NONE, INTERNAL, EXTERNAL
          father: "",
          father_external_id: "",
          insemination_sire_origin: "NONE", // NONE, INTERNAL, EXTERNAL
          insemination_sire: "",
          insemination_sire_external_id: "",
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

            if (values.mother_origin === "INTERNAL" && values.mother) {
              payload.mother = Number(values.mother);
            } else if (values.mother_origin === "EXTERNAL" && values.mother_external_id) {
              payload.mother_external_id = values.mother_external_id;
            }

            if (values.father_origin === "INTERNAL" && values.father) {
              payload.father = Number(values.father);
            } else if (values.father_origin === "EXTERNAL" && values.father_external_id) {
              payload.father_external_id = values.father_external_id;
            }

            if (breedingReady) {
              payload.is_pregnant = values.is_pregnant === "true";
              if (values.is_pregnant === "true") {
                payload.insemination_date = values.insemination_date;
                payload.breeding_method = values.breeding_method;
                if (values.insemination_sire_origin === "INTERNAL" && values.insemination_sire) {
                  payload.insemination_sire = Number(values.insemination_sire);
                } else if (values.insemination_sire_origin === "EXTERNAL" && values.insemination_sire_external_id) {
                  payload.insemination_sire_external_id = values.insemination_sire_external_id;
                }
              } else if (values.has_calved === "true" && values.last_calving_date) {
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
          const ageLabel = values.date_of_birth ? formatAge(values.date_of_birth, age, language) : null;
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
            ? t("cattle.form.stageHintMale")
            : !values.date_of_birth
              ? t("cattle.form.stageHintNoDob")
              : isCalf
                ? t("cattle.form.stageHintCalf")
                : age != null && age < firstBreedingAge
                  ? t("cattle.form.stageHintHeifer")
                  : t("cattle.form.stageHintCow");

          return (
            <Form className="space-y-4">
              <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">{t("cattle.form.photosRequired")}</p>
                <PhotoUploadField
                  label={t("cattle.form.front")}
                  preview={previews.photo_front}
                  required
                  onChange={(file) => setPhoto("photo_front", file)}
                />
                <PhotoUploadField
                  label={t("cattle.form.leftSide")}
                  preview={previews.photo_left}
                  required
                  onChange={(file) => setPhoto("photo_left", file)}
                />
                <PhotoUploadField
                  label={t("cattle.form.rightSide")}
                  preview={previews.photo_right}
                  required
                  onChange={(file) => setPhoto("photo_right", file)}
                />
              </div>

              <Input
                label={t("cattle.form.tagId")}
                name="tag_id"
                value={values.tag_id}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.tag_id ? errors.tag_id : undefined}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={t("cattle.form.name")}
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Select
                  label={t("cattle.form.breed")}
                  name="breed"
                  value={values.breed}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={[
                    { label: t("cattle.form.select"), value: "" },
                    { label: t("cattle.breeds.holstein"), value: "Holstein Friesian" },
                    { label: t("cattle.breeds.jersey"), value: "Jersey" },
                    { label: t("cattle.breeds.boran"), value: "Boran" },
                    { label: t("cattle.breeds.fogera"), value: "Fogera" },
                    { label: t("cattle.breeds.horro"), value: "Horro" },
                    { label: t("cattle.breeds.crossbreed"), value: "Crossbreed" },
                    { label: t("cattle.breeds.begait"), value: "Begait" },
                    { label: t("cattle.breeds.barca"), value: "Barca" },
                    { label: t("cattle.breeds.other"), value: "Other" },
                  ]}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label={t("cattle.form.gender")}
                  name="sex"
                  value={values.sex}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue("is_pregnant", "");
                    setFieldValue("insemination_date", "");
                    setFieldValue("has_calved", "");
                    setFieldValue("last_calving_date", "");
                  }}
                  onBlur={handleBlur}
                  options={[
                    { label: t("cattle.form.femaleDefault"), value: "FEMALE" },
                    { label: t("cattle.form.male"), value: "MALE" },
                  ]}
                />
                <Input
                  label={t("cattle.form.dob")}
                  name="date_of_birth"
                  type="date"
                  value={values.date_of_birth}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue("is_pregnant", "");
                    setFieldValue("insemination_date", "");
                    setFieldValue("has_calved", "");
                    setFieldValue("last_calving_date", "");
                  }}
                  onBlur={handleBlur}
                />
              </div>

              <div className="rounded-xl bg-primary/5 px-3.5 py-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  {ageLabel ? `${t("cattle.form.ageLabel")}${ageLabel}` : t("cattle.form.ageUnknown")}
                </p>
                <p className="mt-1">{stageHint}</p>
              </div>

              <div className="space-y-3 rounded-xl border border-border p-3">
                <p className="text-sm font-semibold">{t("cattle.pedigree.title")}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label={t("cattle.pedigree.motherOrigin")}
                    name="mother_origin"
                    value={values.mother_origin}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("mother", "");
                      setFieldValue("mother_external_id", "");
                    }}
                    onBlur={handleBlur}
                    options={[
                      { label: t("cattle.pedigree.originUnknown"), value: "NONE" },
                      { label: t("cattle.pedigree.originInternal"), value: "INTERNAL" },
                      { label: t("cattle.pedigree.originExternal"), value: "EXTERNAL" },
                    ]}
                  />
                  {values.mother_origin === "INTERNAL" && (
                    <CattleSelect
                      label={t("cattle.form.selectMother")}
                      name="mother"
                      value={values.mother}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      animals={herd}
                      isLoading={cattleChoices.isLoading}
                      filter={(c) => c.sex === "FEMALE"}
                    />
                  )}
                  {values.mother_origin === "EXTERNAL" && (
                    <Input
                      label={t("cattle.form.motherExternalId")}
                      name="mother_external_id"
                      value={values.mother_external_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Farm X - Tag 999"
                    />
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label="Father (Sire) origin"
                    name="father_origin"
                    value={values.father_origin}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("father", "");
                      setFieldValue("father_external_id", "");
                    }}
                    onBlur={handleBlur}
                    options={[
                      { label: "None", value: "NONE" },
                      { label: "Internal (On Farm)", value: "INTERNAL" },
                      { label: "External (AI / Other)", value: "EXTERNAL" },
                    ]}
                  />
                  {values.father_origin === "INTERNAL" && (
                    <CattleSelect
                      label="Select Sire"
                      name="father"
                      value={values.father}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      animals={herd}
                      isLoading={cattleChoices.isLoading}
                      filter={(c) => c.sex === "MALE"}
                    />
                  )}
                  {values.father_origin === "EXTERNAL" && (
                    <Input
                      label="External Bull ID"
                      name="father_external_id"
                      value={values.father_external_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Sire #12345"
                    />
                  )}
                </div>
              </div>

              {showRepro ? (
                <div className="space-y-3 rounded-xl border border-border p-3">
                  <p className="text-sm font-semibold">{t("cattle.form.reproduction")}</p>
                  <Select
                    label={t("cattle.form.isPregnant")}
                    name="is_pregnant"
                    value={values.is_pregnant}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={[
                      { label: t("cattle.form.select"), value: "" },
                      { label: t("cattle.form.yesPregnant"), value: "true" },
                      { label: t("cattle.form.noPregnant"), value: "false" },
                    ]}
                  />

                  {values.is_pregnant === "true" ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          label={t("cattle.form.inseminationDate")}
                          name="insemination_date"
                          type="date"
                          value={values.insemination_date}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <Select
                          label={t("cattle.form.method")}
                          name="breeding_method"
                          value={values.breeding_method}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          options={[
                            { label: t("cattle.form.methodAI"), value: "AI" },
                            { label: t("cattle.form.methodNatural"), value: "NATURAL" },
                          ]}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Select
                          label="Bull (Sire) origin"
                          name="insemination_sire_origin"
                          value={values.insemination_sire_origin}
                          onChange={(e) => {
                            handleChange(e);
                            setFieldValue("insemination_sire", "");
                            setFieldValue("insemination_sire_external_id", "");
                          }}
                          onBlur={handleBlur}
                          options={[
                            { label: "None / Unknown", value: "NONE" },
                            { label: "Internal (On Farm)", value: "INTERNAL" },
                            { label: "External (AI / Other)", value: "EXTERNAL" },
                          ]}
                        />
                        {values.insemination_sire_origin === "INTERNAL" && (
                          <CattleSelect
                            label="Select Bull"
                            name="insemination_sire"
                            value={values.insemination_sire}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            animals={herd}
                            isLoading={cattleChoices.isLoading}
                            filter={(c) => c.sex === "MALE"}
                          />
                        )}
                        {values.insemination_sire_origin === "EXTERNAL" && (
                          <Input
                            label="External Bull ID"
                            name="insemination_sire_external_id"
                            value={values.insemination_sire_external_id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g. Bull #999"
                          />
                        )}
                      </div>
                      {expectedCalving ? (
                        <p className="text-xs text-muted-foreground">
                          {t("cattle.form.expectedCalving")} <strong>{expectedCalving}</strong> (
                          {gestationDays}-{t("cattle.form.gestation")}).
                        </p>
                      ) : null}
                    </>
                  ) : null}

                  {values.is_pregnant === "false" ? (
                    <>
                      <Select
                        label="Has this cow calved before?"
                        name="has_calved"
                        value={values.has_calved}
                        onChange={(e) => {
                          handleChange(e);
                          if (e.target.value !== "true") {
                            setFieldValue("last_calving_date", "");
                          }
                        }}
                        onBlur={handleBlur}
                        options={[
                          { label: "Select…", value: "" },
                          { label: "Yes (has previous calving record)", value: "true" },
                          { label: "No (never calved / virgin heifer)", value: "false" },
                        ]}
                      />
                      {values.has_calved === "true" ? (
                        <Input
                          label={t("cattle.form.recentCalvingDate")}
                          name="last_calving_date"
                          type="date"
                          value={values.last_calving_date}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          hint={t("cattle.form.recentCalvingHint")}
                        />
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}

              <Textarea
                label={t("cattle.form.notes")}
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={create.isPending}>
                {t("cattle.form.saveAnimal")}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
