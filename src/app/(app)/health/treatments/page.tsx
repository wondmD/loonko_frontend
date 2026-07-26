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
import { formatMoney } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";

const schema = Yup.object({
  cattle: Yup.string().required(),
  diagnosis: Yup.string().required(),
  medication: Yup.string(),
  start_date: Yup.string().required(),
  end_date: Yup.string(),
  veterinarian_name: Yup.string(),
  cost: Yup.number().min(0).nullable(),
  outcome: Yup.string(),
  notes: Yup.string(),
});

export default function TreatmentsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role === "OWNER" || role === "VETERINARIAN";
  const [open, setOpen] = useState(false);
  const health = useHealth();
  const cattle = useCattle({ status: "ACTIVE" });
  const rows = health.treatments.data?.results ?? [];
  const options =
    cattle.list.data?.results.map((c) => ({ label: c.tag_id, value: String(c.id) })) ?? [];

  return (
    <div>
      <PageHeader
        title="Health"
        description="Clinical treatments. Optional cost posts to Finance."
        actions={
          canWrite ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Add treatment
            </Button>
          ) : null
        }
      />

      <ModuleTabs
        items={[
          { href: "/health", label: "Records", exact: true },
          { href: "/health/vaccinations", label: "Vaccinations" },
          { href: "/health/treatments", label: "Treatments" },
        ]}
      />

      {health.treatments.isLoading ? <LoadingState /> : null}
      {health.treatments.isError ? (
        <ErrorState
          message="Failed to load treatments."
          onRetry={() => health.treatments.refetch()}
        />
      ) : null}
      {!health.treatments.isLoading && rows.length === 0 ? (
        <EmptyState title="No treatments" description="Record diagnosis and medication here." />
      ) : null}

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">
                {row.cattle_tag} · {row.diagnosis}
              </p>
              {row.cost != null && Number(row.cost) > 0 ? (
                <Badge>{formatMoney(row.cost)}</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Started {row.start_date}
              {row.medication ? ` · ${row.medication}` : ""}
            </p>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add treatment">
        <Formik
          initialValues={{
            cattle: options[0]?.value || "",
            diagnosis: "",
            medication: "",
            start_date: new Date().toISOString().slice(0, 10),
            end_date: "",
            veterinarian_name: "",
            cost: "" as string | number,
            outcome: "",
            notes: "",
          }}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              await health.createTreatment.mutateAsync({
                cattle: Number(values.cattle),
                diagnosis: values.diagnosis,
                medication: values.medication,
                start_date: values.start_date,
                end_date: values.end_date || null,
                veterinarian_name: values.veterinarian_name,
                cost:
                  values.cost === "" || values.cost == null
                    ? null
                    : String(values.cost),
                outcome: values.outcome,
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
                label="Cattle"
                name="cattle"
                value={values.cattle}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[{ label: "Select…", value: "" }, ...options]}
              />
              <Input
                label="Diagnosis"
                name="diagnosis"
                value={values.diagnosis}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Input
                label="Medication"
                name="medication"
                value={values.medication}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start date"
                  name="start_date"
                  type="date"
                  value={values.start_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label="End date"
                  name="end_date"
                  type="date"
                  value={values.end_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <Input
                label="Veterinarian"
                name="veterinarian_name"
                value={values.veterinarian_name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Input
                label="Cost (optional)"
                name="cost"
                type="number"
                step="0.01"
                value={values.cost}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Input
                label="Outcome"
                name="outcome"
                value={values.outcome}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Textarea
                label="Notes"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button
                type="submit"
                className="w-full"
                loading={health.createTreatment.isPending}
              >
                Save
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
