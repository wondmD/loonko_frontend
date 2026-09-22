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
import { CattleSelect } from "@/features/cattle/components/cattle-select";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { BREEDING_TABS } from "@/features/breeding/breeding-tabs";
import { useBreeding } from "@/features/breeding/hooks/use-breeding";
import { useCattleChoices } from "@/features/cattle/hooks/use-cattle";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth-store";

const schema = Yup.object({
  pregnancy: Yup.string().required("Select a pregnancy"),
  calving_date: Yup.string().required("Calving date is required"),
  calf_tag_id: Yup.string(),
  calf_sex: Yup.string(),
  calf_sire_origin: Yup.string(),
  calf_sire: Yup.string(),
  calf_sire_external_id: Yup.string(),
  complications: Yup.string(),
  notes: Yup.string(),
});

export default function CalvingPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role === "OWNER" || role === "WORKER";
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const breeding = useBreeding();
  const { data: cattleChoices, isLoading: cattleChoicesLoading } = useCattleChoices({
    status: "ACTIVE",
  });
  const sires = (cattleChoices?.results ?? []).filter((c) => c.sex === "MALE");

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
            calf_sire_origin: "NONE",
            calf_sire: "",
            calf_sire_external_id: "",
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
                calf_sire: values.calf_tag_id && values.calf_sire ? Number(values.calf_sire) : undefined,
                calf_sire_external_id: values.calf_tag_id ? values.calf_sire_external_id : "",
                complications: values.complications,
                notes: values.notes,
              });
              setOpen(false);
            } catch (error) {
              helpers.setStatus(getMutationError(error).message);
            }
          }}
        >
          {({ values, handleChange, handleBlur, setFieldValue, status }) => {
            const selectedPreg = duePregnancies.find((p) => String(p.id) === values.pregnancy);
            const hasSire = selectedPreg && (selectedPreg.sire || selectedPreg.sire_external_id);
            
            return (
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
                max={new Date().toISOString().slice(0, 10)}
                value={values.calving_date}
                onChange={handleChange}
                onBlur={handleBlur}
                hint="Must be at least 9 months (270 days) from dam's previous calving."
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

                {values.calf_tag_id && hasSire ? (
                  <div className="rounded-xl border border-border p-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Sire tracked automatically</p>
                    <p>The father is recorded on the original breeding event.</p>
                  </div>
                ) : null}

                {values.calf_tag_id && !hasSire ? (
                  <div className="space-y-3 rounded-xl border border-border p-3">
                    <p className="text-sm font-medium">Calf Father (Optional)</p>
                    <Select
                      label="Sire origin"
                      name="calf_sire_origin"
                      value={values.calf_sire_origin}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue("calf_sire", "");
                        setFieldValue("calf_sire_external_id", "");
                      }}
                      onBlur={handleBlur}
                      options={[
                        { label: "None / Unknown", value: "NONE" },
                        { label: "Internal (On Farm)", value: "INTERNAL" },
                        { label: "External (AI / Other)", value: "EXTERNAL" },
                      ]}
                    />
                    {values.calf_sire_origin === "INTERNAL" && (
                      <CattleSelect
                        label="Select Bull"
                        name="calf_sire"
                        value={values.calf_sire}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        animals={sires}
                        isLoading={cattleChoicesLoading}
                      />
                    )}
                    {values.calf_sire_origin === "EXTERNAL" && (
                      <Input
                        label="External Bull ID"
                        name="calf_sire_external_id"
                        value={values.calf_sire_external_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Bull #999"
                      />
                    )}
                  </div>
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
          )}}
        </Formik>
      </Modal>
    </div>
  );
}
