"use client";

import { Form, Formik } from "formik";
import * as Yup from "yup";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { buildCattleFormData, useCattle } from "@/features/cattle/hooks/use-cattle";
import { useTranslation } from "@/lib/i18n";
import type { CattleDetail } from "@/types";

const schema = Yup.object({
  tag_id: Yup.string().required("Tag ID is required"),
  name: Yup.string(),
  breed: Yup.string(),
  sex: Yup.mixed<"FEMALE" | "MALE">().oneOf(["FEMALE", "MALE"]).required(),
  date_of_birth: Yup.string(),
  status: Yup.mixed<"ACTIVE" | "SOLD" | "DEAD" | "CULLED">()
    .oneOf(["ACTIVE", "SOLD", "DEAD", "CULLED"])
    .required(),
  notes: Yup.string(),
});

export function EditCattleModal({
  open,
  onClose,
  cattle,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  cattle: CattleDetail;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const { update } = useCattle();

  return (
    <Modal open={open} onClose={onClose} title={`${t("cattle.form.editAnimal")}${cattle.tag_id}`} className="sm:max-w-xl">
      <Formik
        enableReinitialize
        initialValues={{
          tag_id: cattle.tag_id,
          name: cattle.name || "",
          breed: cattle.breed || "",
          sex: cattle.sex,
          date_of_birth: cattle.date_of_birth || "",
          status: cattle.status,
          notes: cattle.notes || "",
        }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          try {
            const form = buildCattleFormData({
              tag_id: values.tag_id,
              name: values.name,
              breed: values.breed,
              sex: values.sex,
              date_of_birth: values.date_of_birth || undefined,
              status: values.status,
              notes: values.notes,
            });
            await update.mutateAsync({ id: cattle.id, payload: form });
            onSaved();
            onClose();
          } catch (error) {
            helpers.setStatus(getMutationError(error).message);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, status }) => (
          <Form className="space-y-4">
            <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {t("cattle.form.editHint")}
            </p>
            <Input
              label={t("cattle.form.tagId")}
              name="tag_id"
              value={values.tag_id}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.tag_id ? errors.tag_id : undefined}
            />
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={t("cattle.form.gender")}
                name="sex"
                value={values.sex}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[
                  { label: t("cattle.form.femaleDefault"), value: "FEMALE" },
                  { label: t("cattle.form.male"), value: "MALE" },
                ]}
              />
              <Select
                label={t("cattle.form.status")}
                name="status"
                value={values.status}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[
                  { label: t("cattle.cattleStatus.active"), value: "ACTIVE" },
                  { label: t("cattle.cattleStatus.sold"), value: "SOLD" },
                  { label: t("cattle.cattleStatus.dead"), value: "DEAD" },
                  { label: t("cattle.cattleStatus.culled"), value: "CULLED" },
                ]}
              />
            </div>
            <Input
              label={t("cattle.form.dob")}
              name="date_of_birth"
              type="date"
              value={values.date_of_birth}
              onChange={handleChange}
              onBlur={handleBlur}
              hint={t("cattle.form.dobHint")}
            />
            <Textarea
              label={t("cattle.form.notes")}
              name="notes"
              value={values.notes}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {status ? <p className="text-sm text-danger">{status}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" loading={update.isPending}>
                {t("cattle.form.saveAnimal")}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
