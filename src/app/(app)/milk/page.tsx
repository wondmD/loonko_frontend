"use client";

import { Form, Formik } from "formik";
import { ChevronRight, Milk as MilkIcon, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useCattle } from "@/features/cattle/hooks/use-cattle";
import { useMilk } from "@/features/milk/hooks/use-milk";
import { canAccess } from "@/lib/auth/access";
import { formatLiters } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";

const schema = Yup.object({
  cattle: Yup.string().required("Select cattle"),
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

import { useTranslation } from "@/lib/i18n";

export default function MilkPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const { t } = useTranslation();
  const canWrite = canAccess(role, "milkWrite");
  const [open, setOpen] = useState(false);
  const milk = useMilk();
  const cattle = useCattle({ status: "ACTIVE" });
  const rows = milk.herd.data?.results ?? [];

  const cattleOptions =
    cattle.list.data?.results.map((c) => ({
      label: `${c.tag_id}${c.name ? ` — ${c.name}` : ""}`,
      value: String(c.id),
    })) ?? [];

  return (
    <div>
      <PageHeader
        title={t("milk.title")}
        description={t("milk.subtitle")}
        actions={
          canWrite ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/milk/new"
                className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium"
              >
                {t("milk.logMilk")}
              </Link>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("milk.logNewYield")}
              </Button>
            </div>
          ) : null
        }
      />

      <ModuleTabs
        items={[
          { href: "/milk", label: t("milk.title"), exact: true },
          { href: "/milk/feed", label: t("husbandry.feedType") },
        ]}
      />

      {milk.herd.isLoading ? <LoadingState /> : null}
      {milk.herd.isError ? (
        <ErrorState
          message="Failed to load milking herd."
          onRetry={() => milk.herd.refetch()}
        />
      ) : null}
      {!milk.herd.isLoading && !milk.herd.isError && rows.length === 0 ? (
        <EmptyState
          icon={MilkIcon}
          title={t("milk.noRecords")}
          description="Add calving history or milk records to see cows here."
        />
      ) : null}

      {rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
              <thead className="border-b border-border bg-muted/40 text-sm uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">{t("cattle.tagId")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">{t("breeding.calvingHistory")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">
                    {t("milk.avgDaily")}
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">
                    {t("breeding.expectedCalving")}
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">
                    DIM
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.cattle_id}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/milk/${row.cattle_id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/milk/${row.cattle_id}`);
                      }
                    }}
                    className="cursor-pointer border-b border-border/70 transition-colors last:border-0 hover:bg-muted/35 focus-visible:bg-muted/35 focus-visible:outline-none"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{row.cattle_number}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        {row.name ? (
                          <span className="text-xs text-muted-foreground">{row.name}</span>
                        ) : null}
                        <Badge
                          tone={row.is_actively_milking ? "success" : "default"}
                          className="text-[10px]"
                        >
                          {row.lactation_stage_label || row.lactation_stage}
                        </Badge>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatShortDate(row.last_birth_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {formatLiters(row.average_milk_production)}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        / day
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatShortDate(row.next_estimated_dry_off)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.milked_days_current_calving != null
                        ? `${row.milked_days_current_calving} d`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      <ChevronRight className="ml-auto h-4 w-4" aria-hidden />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title={t("milk.logNewYield")}>
        <Formik
          initialValues={{
            cattle: cattleOptions[0]?.value || "",
            date: new Date().toISOString().slice(0, 10),
            morning_liters: 0,
            evening_liters: 0,
            notes: "",
          }}
          enableReinitialize
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              await milk.create.mutateAsync({
                cattle: Number(values.cattle),
                date: values.date,
                morning_liters: String(values.morning_liters),
                evening_liters: String(values.evening_liters),
                notes: values.notes,
              });
              setOpen(false);
            } catch (error) {
              helpers.setStatus(getMutationError(error).message);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, status }) => (
            <Form className="space-y-4">
              <Select
                label={t("cattle.title")}
                name="cattle"
                value={values.cattle}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[{ label: "Select…", value: "" }, ...cattleOptions]}
                error={touched.cattle ? errors.cattle : undefined}
              />
              <Input
                label="Date"
                name="date"
                type="date"
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.date ? errors.date : undefined}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t("milk.morningYield")}
                  name="morning_liters"
                  type="number"
                  step="0.1"
                  value={values.morning_liters}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label={t("milk.eveningYield")}
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
