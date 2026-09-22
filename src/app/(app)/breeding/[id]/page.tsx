"use client";

import { Form, Formik } from "formik";
import { ArrowLeft, Dna, Plus } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import * as Yup from "yup";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import { CattleSelect } from "@/features/cattle/components/cattle-select";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useBreeding, useBreedingCattleHistory } from "@/features/breeding/hooks/use-breeding";
import { useCattleChoices } from "@/features/cattle/hooks/use-cattle";
import { useAuthStore } from "@/stores/auth-store";

import { useTranslation } from "@/lib/i18n";

const eventSchema = Yup.object({
  mating_date: Yup.string().required(),
  method: Yup.string().required(),
  sire_origin: Yup.string(),
  sire: Yup.string(),
  sire_external_id: Yup.string(),
  notes: Yup.string(),
});

function formatShortDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function pregnancyTone(state: string) {
  if (state === "pregnant") return "accent" as const;
  if (state === "unconfirmed") return "warning" as const;
  return "default" as const;
}

export default function BreedingCattleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const cattleId = Number(id);
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role === "OWNER" || role === "WORKER";
  const canConfirm = role === "OWNER" || role === "VETERINARIAN";
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const history = useBreedingCattleHistory(cattleId);
  const breeding = useBreeding();
  const { data: cattleChoices, isLoading: cattleChoicesLoading } = useCattleChoices({
    status: "ACTIVE",
  });
  const sires = (cattleChoices?.results ?? []).filter((c) => c.sex === "MALE");
  const data = history.data;

  if (history.isLoading) return <LoadingState />;
  if (history.isError || !data) {
    return (
      <ErrorState
        message="Could not load breeding history."
        onRetry={() => history.refetch()}
      />
    );
  }

  const ev = data.next_event;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <Link
            href="/breeding"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("breedingDetail.backToHerd")}
          </Link>
        }
        title={data.cattle_number}
        description={
          data.name
            ? `${data.name} · ${t("breedingDetail.reproductiveTimeline")}`
            : t("breedingDetail.reproductiveTimeline")
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={pregnancyTone(data.pregnancy_state)}>
              {data.pregnancy_state_label}
            </Badge>
            {canConfirm && data.can_confirm_pregnancy && data.pregnancy_id ? (
              <Button
                onClick={() =>
                  breeding.updatePregnancy.mutate(
                    { id: data.pregnancy_id!, payload: { status: "PREGNANT" } },
                    { onSuccess: () => history.refetch() },
                  )
                }
              >
                {t("breedingDetail.confirmPregnant")}
              </Button>
            ) : null}
            {canWrite ? (
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("breedingDetail.logMating")}
              </Button>
            ) : null}
            {data.can_record_calving ? (
              <Link
                href="/breeding/calving"
                className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium"
              >
                {t("breedingDetail.recordCalving")}
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("breedingDetail.lastAi")}
          value={formatShortDate(data.last_insemination_date)}
          hint={
            data.breeding_method
              ? `${data.breeding_method}${
                  data.days_since_insemination != null
                    ? ` · ${data.days_since_insemination}d ago`
                    : ""
                }`
              : undefined
          }
        />
        <StatCard
          label={t("breedingDetail.expectedCalving")}
          value={formatShortDate(data.expected_calving_date)}
          hint={
            data.days_to_calving != null
              ? data.days_to_calving < 0
                ? `${Math.abs(data.days_to_calving)}d overdue`
                : `in ${data.days_to_calving}d`
              : data.days_open != null
                ? `${data.days_open}d open`
                : undefined
          }
        />
        <StatCard
          label={t("breedingDetail.nextEvent")}
          value={ev?.title || "—"}
          hint={
            ev
              ? `${formatShortDate(ev.date)} · ${
                  ev.is_overdue || ev.days_until < 0
                    ? `${Math.abs(ev.days_until)}d overdue`
                    : ev.days_until === 0
                      ? "today"
                      : `in ${ev.days_until}d`
                }`
              : data.action_hint
          }
        />
        <StatCard
          label={t("breedingDetail.history")}
          value={`${data.birth_count} ${t("breeding.calvingHistory")}`}
          hint={`${data.event_count} ${t("breedingDetail.service")} · ${data.pregnancy_count} ${t("cattleDetail.pregnancies")}`}
        />
      </div>

      {data.cycles.length === 0 ? (
        <EmptyState
          icon={Dna}
          title={t("breedingDetail.noCyclesYet")}
          description={t("breedingDetail.startTimelineHint")}
        />
      ) : null}

      <div className="space-y-4">
        {data.cycles.map((cycle, idx) => (
          <Card key={`${cycle.label}-${idx}`}>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-semibold">{cycle.label}</h2>
                  {cycle.is_current ? <Badge tone="accent">{t("common.active")}</Badge> : null}
                  <Badge>{cycle.outcome}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {cycle.mating ? (
                <div className="rounded-xl border border-border px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("breedingDetail.service")}
                  </p>
                  <p className="mt-1 font-medium">
                    {formatShortDate(cycle.mating.mating_date)} · {cycle.mating.method}
                  </p>
                  {cycle.mating.notes ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{cycle.mating.notes}</p>
                  ) : null}
                </div>
              ) : null}
              {cycle.pregnancy ? (
                <div className="rounded-xl border border-border px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("breeding.pregnancyStatus")}
                  </p>
                  <p className="mt-1 font-medium">
                    {cycle.pregnancy.status}
                    {cycle.pregnancy.confirmed_on
                      ? ` · ${t("common.completed")} ${formatShortDate(cycle.pregnancy.confirmed_on)}`
                      : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ECD {formatShortDate(cycle.expected_calving_date)}
                  </p>
                </div>
              ) : null}
              {cycle.birth ? (
                <div className="rounded-xl border border-border px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("calvingPage.title")}
                  </p>
                  <p className="mt-1 font-medium">
                    {formatShortDate(cycle.calving_date)}
                    {cycle.birth.calf_tag_id ? ` · ${t("cattleDetail.calf")} ${cycle.birth.calf_tag_id}` : ""}
                    {cycle.birth.calf_sex ? ` · ${cycle.birth.calf_sex}` : ""}
                  </p>
                  {cycle.birth.complications ? (
                    <p className="mt-0.5 text-xs text-danger">{cycle.birth.complications}</p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`${t("breedingDetail.logMating")} · ${data.cattle_number}`}>
        <Formik
          initialValues={{
            mating_date: new Date().toISOString().slice(0, 10),
            method: "AI",
            sire_origin: "NONE",
            sire: "",
            sire_external_id: "",
            notes: "",
          }}
          validationSchema={eventSchema}
          onSubmit={async (values, helpers) => {
            try {
              const payload: Record<string, string | number> = {
                dam: cattleId,
                mating_date: values.mating_date,
                method: values.method as "AI" | "NATURAL",
                notes: values.notes,
              };
              if (values.sire_origin === "INTERNAL" && values.sire) {
                payload.sire = Number(values.sire);
              } else if (values.sire_origin === "EXTERNAL" && values.sire_external_id) {
                payload.sire_external_id = values.sire_external_id;
              }
              await breeding.createEvent.mutateAsync(payload);
              setOpen(false);
              history.refetch();
            } catch (error) {
              helpers.setStatus(getMutationError(error).message);
            }
          }}
        >
          {({ values, handleChange, handleBlur, setFieldValue, status }) => (
            <Form className="flex min-w-0 flex-col gap-3 sm:gap-4">
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label={t("breedingDetail.matingDate")}
                  name="mating_date"
                  type="date"
                  value={values.mating_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Select
                  label={t("breedingDetail.method")}
                  name="method"
                  value={values.method}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={[
                    { label: t("breedingDetail.ai"), value: "AI" },
                    { label: t("breedingDetail.natural"), value: "NATURAL" },
                  ]}
                />
              </div>

              <div className="min-w-0 space-y-3 rounded-xl border border-border p-3">
                <Select
                  label="Sire origin"
                  name="sire_origin"
                  value={values.sire_origin}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue("sire", "");
                    setFieldValue("sire_external_id", "");
                  }}
                  onBlur={handleBlur}
                  options={[
                    { label: "None", value: "NONE" },
                    { label: "Internal (On Farm)", value: "INTERNAL" },
                    { label: "External (AI / Other)", value: "EXTERNAL" },
                  ]}
                />
                {values.sire_origin === "INTERNAL" && (
                  <CattleSelect
                    label="Select Sire"
                    name="sire"
                    value={values.sire}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    animals={sires}
                    isLoading={cattleChoicesLoading}
                  />
                )}
                {values.sire_origin === "EXTERNAL" && (
                  <Input
                    label="External Bull ID"
                    name="sire_external_id"
                    value={values.sire_external_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Sire #12345"
                  />
                )}
              </div>

              <Textarea
                label={t("cattle.notes")}
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                className="min-h-20 sm:min-h-28"
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button
                type="submit"
                className="sticky bottom-0 z-10 w-full min-h-12 bg-card pt-1"
                loading={breeding.createEvent.isPending}
              >
                {t("common.save")}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
