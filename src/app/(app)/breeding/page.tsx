"use client";

import { Form, Formik } from "formik";
import { ChevronRight, Dna, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useBreeding } from "@/features/breeding/hooks/use-breeding";
import { BREEDING_TABS } from "@/features/breeding/breeding-tabs";
import { useCattleChoices } from "@/features/cattle/hooks/use-cattle";
import type { BreedingHerdRow } from "@/types";
import { useAuthStore } from "@/stores/auth-store";

const eventSchema = Yup.object({
  dam: Yup.string().required("Select a mother"),
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

function pregnancyTone(state: BreedingHerdRow["pregnancy_state"]) {
  if (state === "pregnant") return "accent" as const;
  if (state === "unconfirmed") return "warning" as const;
  return "default" as const;
}

function formatEventTiming(daysUntil: number | undefined, overdue?: boolean) {
  if (daysUntil == null) return "";
  if (overdue || daysUntil < 0) return `${Math.abs(daysUntil)}d overdue`;
  if (daysUntil === 0) return "today";
  return `in ${daysUntil}d`;
}

import { useTranslation } from "@/lib/i18n";

export default function BreedingPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const { t } = useTranslation();
  const canCreateEvent = role === "OWNER" || role === "WORKER";
  const canConfirm = role === "OWNER" || role === "VETERINARIAN";
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pregnant" | "unconfirmed" | "not_pregnant">(
    "all",
  );
  const breeding = useBreeding();
  const cattle = useCattleChoices({ status: "ACTIVE" });
  const rows = breeding.herd.data?.results ?? [];

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.pregnancy_state === filter);
  }, [rows, filter]);

  const dams = (cattle.data?.results ?? []).filter((c) => c.sex !== "MALE");
  const sires = (cattle.data?.results ?? []).filter((c) => c.sex === "MALE");

  const counts = useMemo(
    () => ({
      all: rows.length,
      pregnant: rows.filter((r) => r.pregnancy_state === "pregnant").length,
      unconfirmed: rows.filter((r) => r.pregnancy_state === "unconfirmed").length,
      not_pregnant: rows.filter((r) => r.pregnancy_state === "not_pregnant").length,
    }),
    [rows],
  );

  return (
    <div>
      <PageHeader
        title={t("breeding.title")}
        description={t("breeding.subtitle")}
        actions={
          canCreateEvent ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("breeding.recordInsemination")}
            </Button>
          ) : null
        }
      />

      <ModuleTabs items={BREEDING_TABS} />

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["all", t("cattle.allStatuses")],
            ["pregnant", t("cattle.pregnant")],
            ["unconfirmed", t("breeding.unconfirmed")],
            ["not_pregnant", t("cattle.dry")],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === key
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {breeding.herd.isLoading ? <LoadingState /> : null}
      {breeding.herd.isError ? (
        <ErrorState
          message="Failed to load breeding herd."
          onRetry={() => breeding.herd.refetch()}
        />
      ) : null}
      {!breeding.herd.isLoading && !breeding.herd.isError && filtered.length === 0 ? (
        <EmptyState
          icon={Dna}
          title="No breeding cattle"
          description="Log a mating or add reproductive history when registering animals."
        />
      ) : null}

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
              <thead className="border-b border-border bg-muted/40 text-sm uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">{t("cattle.tagId")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">{t("breeding.pregnancyStatus")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">{t("breeding.inseminationDate")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">{t("breeding.expectedCalving")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">{t("husbandry.taskName")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Focus</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const ev = row.next_event;
                  return (
                    <tr
                      key={row.cattle_id}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/breeding/${row.cattle_id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/breeding/${row.cattle_id}`);
                        }
                      }}
                      className="cursor-pointer border-b border-border/70 transition-colors last:border-0 hover:bg-muted/35 focus-visible:bg-muted/35 focus-visible:outline-none"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{row.cattle_number}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          {row.name ? (
                            <span className="text-xs text-muted-foreground">{row.name}</span>
                          ) : null}
                          {row.lactation_stage_label ? (
                            <Badge className="text-[10px]">{row.lactation_stage_label}</Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={pregnancyTone(row.pregnancy_state)}>
                          {row.pregnancy_state_label}
                        </Badge>
                        {row.days_open != null && row.pregnancy_state === "not_pregnant" ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {row.days_open}d open
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        <div>{formatShortDate(row.last_insemination_date)}</div>
                        {row.breeding_method || row.days_since_insemination != null ? (
                          <p className="mt-0.5 text-xs">
                            {[
                              row.breeding_method,
                              row.days_since_insemination != null
                                ? `${row.days_since_insemination}d ago`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatShortDate(row.expected_calving_date)}
                        {row.days_to_calving != null ? (
                          <p className="mt-0.5 text-xs">
                            {row.days_to_calving < 0
                              ? `${Math.abs(row.days_to_calving)}d overdue`
                              : `in ${row.days_to_calving}d`}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {ev ? (
                          <div>
                            <p className="font-medium">{ev.title}</p>
                            <p
                              className={`text-xs ${
                                ev.is_overdue ? "text-danger" : "text-muted-foreground"
                              }`}
                            >
                              {formatShortDate(ev.date)} ·{" "}
                              {formatEventTiming(ev.days_until, ev.is_overdue)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-muted-foreground">{row.action_hint}</p>
                        {canConfirm && row.can_confirm_pregnancy && row.pregnancy_id ? (
                          <Button
                            type="button"
                            className="mt-1 h-8 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              breeding.updatePregnancy.mutate({
                                id: row.pregnancy_id!,
                                payload: { status: "PREGNANT" },
                              });
                            }}
                          >
                            Confirm
                          </Button>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        <ChevronRight className="ml-auto h-4 w-4" aria-hidden />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title={t("breeding.recordInsemination")}>
        <Formik
          initialValues={{
            dam: dams[0] ? String(dams[0].id) : "",
            mating_date: new Date().toISOString().slice(0, 10),
            method: "AI",
            sire_origin: "NONE",
            sire: "",
            sire_external_id: "",
            notes: "",
          }}
          enableReinitialize
          validationSchema={eventSchema}
          onSubmit={async (values, helpers) => {
            try {
              await breeding.createEvent.mutateAsync({
                dam: Number(values.dam),
                mating_date: values.mating_date,
                method: values.method as "AI" | "NATURAL",
                sire: values.sire ? Number(values.sire) : undefined,
                sire_external_id: values.sire_external_id || "",
                notes: values.notes,
              });
              setOpen(false);
            } catch (error) {
              helpers.setStatus(getMutationError(error).message);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, status }) => (
            <Form className="space-y-4">
              <CattleSelect
                label={t("cattle.motherTag")}
                name="dam"
                value={values.dam}
                onChange={handleChange}
                onBlur={handleBlur}
                animals={dams}
                isLoading={cattle.isLoading}
                error={touched.dam ? errors.dam : undefined}
              />
              <Input
                label={t("breeding.inseminationDate")}
                name="mating_date"
                type="date"
                value={values.mating_date}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Select
                label="Method"
                name="method"
                value={values.method}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[
                  { label: "AI", value: "AI" },
                  { label: "Natural", value: "NATURAL" },
                ]}
              />

              <div className="space-y-3 rounded-xl border border-border p-3">
                <p className="text-sm font-medium">Bull (Sire) Details</p>
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
                    { label: "None / Unknown", value: "NONE" },
                    { label: "Internal (On Farm)", value: "INTERNAL" },
                    { label: "External (AI / Other)", value: "EXTERNAL" },
                  ]}
                />
                {values.sire_origin === "INTERNAL" && (
                  <CattleSelect
                    label="Select Bull"
                    name="sire"
                    value={values.sire}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    animals={sires}
                    isLoading={cattle.isLoading}
                  />
                )}
                {values.sire_origin === "EXTERNAL" && (
                  <Input
                    label="External Bull ID"
                    name="sire_external_id"
                    value={values.sire_external_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Bull #999"
                  />
                )}
              </div>

              <Textarea
                label={t("cattle.notes")}
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={breeding.createEvent.isPending}>
                {t("common.save")}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
