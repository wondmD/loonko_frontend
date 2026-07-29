"use client";

import { Form, Formik } from "formik";
import { ArrowLeft, Milk as MilkIcon, Plus } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import * as Yup from "yup";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useMilk, useMilkCattleHistory } from "@/features/milk/hooks/use-milk";
import { canAccess } from "@/lib/auth/access";
import { formatLiters } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";

import { useTranslation } from "@/lib/i18n";

const schema = Yup.object({
  date: Yup.string().required("Date is required"),
  morning_liters: Yup.number().min(0).required(),
  evening_liters: Yup.number().min(0).required(),
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

export default function MilkCattleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const cattleId = Number(id);
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = canAccess(role, "milkWrite");
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const history = useMilkCattleHistory(cattleId);
  const milk = useMilk();
  const data = history.data;

  if (history.isLoading) return <LoadingState />;
  if (history.isError || !data) {
    return (
      <ErrorState
        message="Could not load milk history for this animal."
        onRetry={() => history.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <Link
            href="/milk"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("milkDetail.backToHerd")}
          </Link>
        }
        title={data.cattle_number}
        description={
          data.name
            ? `${data.name} · ${t("milkDetail.historyByCycle")}`
            : t("milkDetail.historyByCycle")
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={data.is_actively_milking ? "success" : "default"}>
              {data.lactation_stage_label || data.lactation_stage}
            </Badge>
            {canWrite ? (
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("common.add")}
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("milkDetail.lastBirth")}
          value={formatShortDate(data.last_birth_date)}
        />
        <StatCard
          label={t("milkDetail.avgProduction")}
          value={formatLiters(data.average_milk_production)}
          hint="Current cycle / day"
        />
        <StatCard
          label={t("milkDetail.nextDryOff")}
          value={formatShortDate(data.next_estimated_dry_off)}
        />
        <StatCard
          label={t("milkDetail.milkedDays")}
          value={
            data.milked_days_current_calving != null
              ? `${data.milked_days_current_calving} d`
              : "—"
          }
          hint={t("milkDetail.currentCalving")}
        />
      </div>

      {data.cycles.length === 0 ? (
        <EmptyState
          icon={MilkIcon}
          title={t("cattleDetail.noMilkRecords")}
          description={t("milk.noRecords")}
        />
      ) : null}

      <div className="space-y-4">
        {data.cycles.map((cycle, idx) => (
          <Card key={`${cycle.calving_date ?? "prior"}-${idx}`}>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-semibold">
                    {cycle.label ||
                      (cycle.is_current
                        ? t("milkDetail.currentCalving")
                        : `${t("milkDetail.calvingIndex")} ${cycle.cycle_index}`)}
                  </h2>
                  {cycle.is_current ? <Badge tone="accent">{t("common.active")}</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cycle.calving_date
                    ? `${formatShortDate(cycle.calving_date)} → ${formatShortDate(cycle.cycle_end)}`
                    : formatShortDate(cycle.cycle_end)}
                  {cycle.calf_tag_id ? ` · ${t("cattleDetail.calf")} ${cycle.calf_tag_id}` : ""}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{formatLiters(cycle.total_liters)} {t("milkDetail.totalLiters")}</p>
                <p className="text-muted-foreground">
                  {formatLiters(cycle.average_daily)}/day · {cycle.record_count} {t("milkDetail.recordsCount")}
                  {cycle.days_in_milk != null ? ` · ${cycle.days_in_milk} ${t("milkDetail.dimAbbr")}` : ""}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {cycle.records.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("cattleDetail.noMilkRecords")}</p>
              ) : (
                <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                    <span>{t("common.date")}</span>
                    <span className="hidden sm:inline">{t("dashboard.morning")}</span>
                    <span className="hidden sm:inline">{t("dashboard.evening")}</span>
                    <span className="text-right">{t("common.total")}</span>
                    <span className="hidden text-right sm:inline">{t("cattle.notes")}</span>
                  </div>
                  {cycle.records.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
                    >
                      <span className="text-sm">{formatShortDate(row.date)}</span>
                      <span className="hidden text-sm text-muted-foreground sm:inline">
                        {formatLiters(row.morning_liters)}
                      </span>
                      <span className="hidden text-sm text-muted-foreground sm:inline">
                        {formatLiters(row.evening_liters)}
                      </span>
                      <span className="text-right text-sm font-medium">
                        {formatLiters(row.total_liters)}
                      </span>
                      <span className="col-span-2 truncate text-xs text-muted-foreground sm:col-span-1 sm:text-right">
                        {row.notes || ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`${t("milkDetail.logMilkTitle")} · ${data.cattle_number}`}>
        <Formik
          initialValues={{
            date: new Date().toISOString().slice(0, 10),
            morning_liters: 0,
            evening_liters: 0,
            notes: "",
          }}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              await milk.create.mutateAsync({
                cattle: cattleId,
                date: values.date,
                morning_liters: String(values.morning_liters),
                evening_liters: String(values.evening_liters),
                notes: values.notes,
              });
              setOpen(false);
              history.refetch();
            } catch (error) {
              helpers.setStatus(getMutationError(error).message);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, status }) => (
            <Form className="space-y-4">
              <Input
                label={t("common.date")}
                name="date"
                type="date"
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.date ? errors.date : undefined}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={`${t("dashboard.morning")} (${t("milk.litersAbbr")})`}
                  name="morning_liters"
                  type="number"
                  step="0.1"
                  value={values.morning_liters}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label={`${t("dashboard.evening")} (${t("milk.litersAbbr")})`}
                  name="evening_liters"
                  type="number"
                  step="0.1"
                  value={values.evening_liters}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <Textarea
                label={t("cattle.notes")}
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={milk.create.isPending}>
                {t("common.save")}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
