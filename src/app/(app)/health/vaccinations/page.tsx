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
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { CattleSelect } from "@/features/cattle/components/cattle-select";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useCattleChoices } from "@/features/cattle/hooks/use-cattle";
import { useHealth } from "@/features/health/hooks/use-health";
import { useTranslation } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";

const schema = Yup.object({
  cattle: Yup.string().required(),
  vaccine_name: Yup.string().required(),
  administered_on: Yup.string().required(),
  next_due_on: Yup.string(),
  veterinarian_name: Yup.string(),
  cost: Yup.number().min(0).nullable(),
});

export default function VaccinationsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role === "OWNER" || role === "VETERINARIAN";
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const health = useHealth();
  const cattle = useCattleChoices({ status: "ACTIVE" });
  const rows = health.vaccinations.data?.results ?? [];
  const animals = cattle.data?.results ?? [];

  return (
    <div>
      <PageHeader
        title={t("health.vaccinations")}
        description="Immunization schedule and history."
        actions={
          canWrite ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("common.add")}
            </Button>
          ) : null
        }
      />

      <ModuleTabs
        items={[
          { href: "/health", label: t("health.records"), exact: true },
          { href: "/health/vaccinations", label: t("health.vaccinations") },
          { href: "/health/treatments", label: t("health.treatments") },
        ]}
      />

      {health.vaccinations.isLoading ? <LoadingState /> : null}
      {health.vaccinations.isError ? (
        <ErrorState
          message="Failed to load vaccinations."
          onRetry={() => health.vaccinations.refetch()}
        />
      ) : null}
      {!health.vaccinations.isLoading && rows.length === 0 ? (
        <EmptyState title={t("health.noVaccinations")} description="Record administered vaccines here." />
      ) : null}

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">
                {row.cattle_tag} · {row.vaccine_name}
              </p>
              {row.next_due_on ? <Badge tone="warning">Due {row.next_due_on}</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Administered {row.administered_on}
              {row.cost != null && Number(row.cost) > 0
                ? ` · ${formatMoney(row.cost)}`
                : ""}
            </p>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`${t("common.add")} ${t("health.vaccinations")}`}>
        <Formik
          initialValues={{
            cattle: animals[0] ? String(animals[0].id) : "",
            vaccine_name: "",
            administered_on: new Date().toISOString().slice(0, 10),
            next_due_on: "",
            veterinarian_name: "",
            cost: "" as string | number,
          }}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              await health.createVaccination.mutateAsync({
                cattle: Number(values.cattle),
                vaccine_name: values.vaccine_name,
                administered_on: values.administered_on,
                next_due_on: values.next_due_on || null,
                veterinarian_name: values.veterinarian_name,
                cost:
                  values.cost === "" || values.cost == null
                    ? null
                    : String(values.cost),
              });
              setOpen(false);
            } catch (error) {
              helpers.setStatus(getMutationError(error).message);
            }
          }}
        >
          {({ values, handleChange, handleBlur, status }) => (
            <Form className="space-y-4">
              <CattleSelect
                label={t("cattle.title")}
                name="cattle"
                value={values.cattle}
                onChange={handleChange}
                onBlur={handleBlur}
                animals={animals}
                isLoading={cattle.isLoading}
              />
              <Input
                label={t("health.vaccine")}
                name="vaccine_name"
                value={values.vaccine_name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Input
                label="Administered on"
                name="administered_on"
                type="date"
                value={values.administered_on}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Input
                label="Next due"
                name="next_due_on"
                type="date"
                value={values.next_due_on}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Input
                label="Veterinarian"
                name="veterinarian_name"
                value={values.veterinarian_name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Input
                label={t("feedPage.costOptional")}
                name="cost"
                type="number"
                step="0.01"
                value={values.cost}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button
                type="submit"
                className="w-full"
                loading={health.createVaccination.isPending}
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
