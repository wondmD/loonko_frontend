"use client";

import { Form, Formik } from "formik";
import { Baby, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import * as Yup from "yup";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ModuleTabs } from "@/components/ui/module-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { BREEDING_TABS } from "@/features/breeding/breeding-tabs";
import { useBreeding } from "@/features/breeding/hooks/use-breeding";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth-store";

const schema = Yup.object({
  pregnancy: Yup.string().required("Select a pregnancy"),
  calving_date: Yup.string().required("Calving date is required"),
  calf_tag_id: Yup.string(),
  calf_sex: Yup.string(),
  complications: Yup.string(),
  notes: Yup.string(),
});

export default function CalvingPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role === "OWNER" || role === "WORKER";
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const breeding = useBreeding();

  const pregnancies = breeding.pregnancies.data?.results ?? [];
  const births = breeding.births.data?.results ?? [];

  const duePregnancies = useMemo(
    () =>
      pregnancies.filter(
        (p) => p.status === "PREGNANT",
      ),
    [pregnancies],
  );

  const pregnancyOptions = duePregnancies.map((p) => ({
    value: String(p.id),
    label: `${p.cattle_tag} · ${p.status}${
      p.expected_calving_date ? ` · due ${p.expected_calving_date}` : ""
    }`,
  }));

  return (
    <div>
      <PageHeader
        title={t("calvingPage.title")}
        description={t("calvingPage.description")}
        actions={
          canWrite ? (
            <Button onClick={() => setOpen(true)} disabled={duePregnancies.length === 0}>
              <Plus className="h-4 w-4" />
              {t("calvingPage.recordCalving")}
            </Button>
          ) : null
        }
      />

      <ModuleTabs items={BREEDING_TABS} />

      {breeding.pregnancies.isLoading || breeding.births.isLoading ? <LoadingState /> : null}
      {breeding.births.isError ? (
        <ErrorState
          message="Failed to load calving records."
          onRetry={() => breeding.births.refetch()}
        />
      ) : null}

      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-semibold">{t("calvingPage.duePregnancies")}</h2>
        {duePregnancies.length === 0 ? (
          <EmptyState
            icon={Baby}
            title={t("calvingPage.noPregnanciesReady")}
            description={t("calvingPage.noPregnanciesReadyHint")}
          />
        ) : (
          <div className="space-y-3">
            {duePregnancies.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-medium">{p.cattle_tag}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Expected: {p.expected_calving_date || "—"}
                    {p.confirmed_on ? ` · confirmed ${p.confirmed_on}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={p.status === "PREGNANT" ? "accent" : "warning"}>{p.status}</Badge>
                  {canWrite ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setOpen(true)}
                    >
                      {t("calvingPage.recordCalving")}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">{t("calvingPage.calvingHistory")}</h2>
        {births.length === 0 ? (
          <EmptyState title={t("calvingPage.noCalvingsYet")} />
        ) : (
          <div className="space-y-3">
            {births.map((b) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{b.cattle_tag || `Pregnancy #${b.pregnancy}`}</p>
                  <Badge tone="success">{b.calving_date}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {b.calf_tag_id
                    ? `${t("cattleDetail.calf")} ${b.calf_tag_id}${b.calf_sex ? ` · ${b.calf_sex}` : ""}`
                    : "No calf registered on this record"}
                </p>
                {b.complications ? (
                  <p className="mt-2 text-xs text-warning">{b.complications}</p>
                ) : null}
                {b.notes ? <p className="mt-1 text-xs text-muted-foreground">{b.notes}</p> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title={t("calvingPage.recordCalving")}>
        <Formik
          initialValues={{
            pregnancy: pregnancyOptions[0]?.value || "",
            calving_date: new Date().toISOString().slice(0, 10),
            calf_tag_id: "",
            calf_sex: "FEMALE",
            complications: "",
            notes: "",
          }}
          enableReinitialize
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              await breeding.createBirth.mutateAsync({
                pregnancy: Number(values.pregnancy),
                calving_date: values.calving_date,
                calf_tag_id: values.calf_tag_id || "",
                calf_sex: values.calf_tag_id ? values.calf_sex : "",
                complications: values.complications,
                notes: values.notes,
              });
              setOpen(false);
            } catch (error) {
              helpers.setStatus(getMutationError(error).message);
            }
          }}
        >
          {({ values, handleChange, handleBlur, status }) => (
            <Form className="space-y-4">
              <Select
                label={t("calvingPage.damPregnancy")}
                name="pregnancy"
                value={values.pregnancy}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[{ label: `${t("common.select")}…`, value: "" }, ...pregnancyOptions]}
              />
              <Input
                label={t("calvingPage.calvingDate")}
                name="calving_date"
                type="date"
                value={values.calving_date}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3">
                <p className="text-sm font-medium">{t("calvingPage.newCalfOptional")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("calvingPage.newCalfHint")}
                </p>
                <Input
                  label={t("calvingPage.calfTagId")}
                  name="calf_tag_id"
                  value={values.calf_tag_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. C-042"
                />
                {values.calf_tag_id ? (
                  <Select
                    label={t("calvingPage.calfGender")}
                    name="calf_sex"
                    value={values.calf_sex}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={[
                      { label: t("cattle.female"), value: "FEMALE" },
                      { label: t("cattle.male"), value: "MALE" },
                    ]}
                  />
                ) : null}
              </div>
              <Textarea
                label={t("calvingPage.complications")}
                name="complications"
                value={values.complications}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Assisted birth, retained placenta…"
              />
              <Textarea
                label={t("cattle.notes")}
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={breeding.createBirth.isPending}>
                {t("common.save")}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
