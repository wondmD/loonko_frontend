"use client";

import { Form, Formik } from "formik";
import { Plus } from "lucide-react";
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
import { useHealth } from "@/features/health/hooks/use-health";
import { canAccess } from "@/lib/auth/access";
import { useAuthStore } from "@/stores/auth-store";

const recordSchema = Yup.object({
  cattle: Yup.string().required(),
  recorded_at: Yup.string().required(),
  symptoms: Yup.string(),
  severity: Yup.string().required(),
  notes: Yup.string(),
});

import { useTranslation } from "@/lib/i18n";

export default function HealthPage() {
  const role = useAuthStore((s) => s.user?.role);
  const { t } = useTranslation();
  const canWrite = canAccess(role, "healthWrite");
  const [open, setOpen] = useState(false);
  const health = useHealth();
  const cattle = useCattle({ status: "ACTIVE" });
  const rows = health.records.data?.results ?? [];
  const options =
    cattle.list.data?.results.map((c) => ({
      label: c.tag_id,
      value: String(c.id),
    })) ?? [];

  return (
    <div>
      <PageHeader
        title={t("health.title")}
        description={t("health.subtitle")}
        actions={
          canWrite ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("health.recordHealth")}
            </Button>
          ) : null
        }
      />

      <ModuleTabs
        items={[
          { href: "/health", label: t("health.treatmentLogs"), exact: true },
          { href: "/health/vaccinations", label: t("health.vaccinations") },
          { href: "/health/treatments", label: t("health.recordNewTreatment") },
        ]}
      />

      {health.records.isLoading ? <LoadingState /> : null}
      {health.records.isError ? (
        <ErrorState
          message="Failed to load health records."
          onRetry={() => health.records.refetch()}
        />
      ) : null}
      {!health.records.isLoading && rows.length === 0 ? (
        <EmptyState title={t("health.noRecords")} description="Log symptoms and observations here." />
      ) : null}

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{row.cattle_tag}</p>
              <Badge
                tone={
                  row.severity === "CRITICAL" || row.severity === "HIGH"
                    ? "danger"
                    : row.severity === "MEDIUM"
                      ? "warning"
                      : "default"
                }
              >
                {row.severity}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(row.recorded_at).toLocaleString()}
            </p>
            <p className="mt-2 text-sm">
              {(row.symptoms || []).join(", ") || "No symptoms listed"}
            </p>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t("health.recordHealth")}>
        <Formik
          initialValues={{
            cattle: options[0]?.value || "",
            recorded_at: new Date().toISOString().slice(0, 16),
            symptoms: "",
            severity: "LOW",
            notes: "",
          }}
          validationSchema={recordSchema}
          onSubmit={async (values, helpers) => {
            try {
              await health.createRecord.mutateAsync({
                cattle: Number(values.cattle),
                recorded_at: new Date(values.recorded_at).toISOString(),
                symptoms: values.symptoms
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                severity: values.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
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
                label={t("cattle.title")}
                name="cattle"
                value={values.cattle}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[{ label: "Select…", value: "" }, ...options]}
              />
              <Input
                label="Recorded at"
                name="recorded_at"
                type="datetime-local"
                value={values.recorded_at}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Input
                label={t("health.symptoms")}
                name="symptoms"
                value={values.symptoms}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Select
                label="Severity"
                name="severity"
                value={values.severity}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[
                  { label: "Low", value: "LOW" },
                  { label: "Medium", value: "MEDIUM" },
                  { label: "High", value: "HIGH" },
                  { label: "Critical", value: "CRITICAL" },
                ]}
              />
              <Textarea
                label={t("cattle.notes")}
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={health.createRecord.isPending}>
                {t("common.save")}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
