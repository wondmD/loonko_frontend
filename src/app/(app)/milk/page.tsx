"use client";

import { Form, Formik } from "formik";
import { Milk as MilkIcon, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import * as Yup from "yup";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ModuleTabs } from "@/components/ui/module-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useCattle } from "@/features/cattle/hooks/use-cattle";
import { useFarm } from "@/features/farm/hooks/use-farm";
import { useMilk } from "@/features/milk/hooks/use-milk";
import { canAccess } from "@/lib/auth/access";
import { formatLiters, formatMoney } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";

const schema = Yup.object({
  cattle: Yup.string().required("Select cattle"),
  date: Yup.string().required("Date is required"),
  morning_liters: Yup.number().min(0).required(),
  evening_liters: Yup.number().min(0).required(),
  notes: Yup.string(),
});

export default function MilkPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = canAccess(role, "milkWrite");
  const [open, setOpen] = useState(false);
  const milk = useMilk();
  const farm = useFarm();
  const cattle = useCattle({ status: "ACTIVE" });
  const rows = milk.list.data?.results ?? [];
  const milkPrice = Number(farm.data?.milk_price_per_liter ?? 0);
  const milkCurrency = farm.data?.currency || "ETB";
  const showValue =
    role === "OWNER" &&
    milkPrice > 0 &&
    (farm.data?.milk_income_mode ?? "ACCRUAL") === "ACCRUAL" &&
    (farm.data?.auto_milk_income ?? true);

  const cattleOptions =
    cattle.list.data?.results.map((c) => ({
      label: `${c.tag_id}${c.name ? ` — ${c.name}` : ""}`,
      value: String(c.id),
    })) ?? [];

  const chartData =
    milk.trends.data?.points.map((p) => ({
      date: String(p.date).slice(5, 10),
      liters: Number(p.liters),
    })) ?? [];

  return (
    <div>
      <PageHeader
        title="Milk"
        description={
          showValue
            ? `Daily production · ${milkPrice} ${milkCurrency}/L`
            : "Daily production and trends."
        }
        actions={
          canWrite ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/milk/new"
                className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium"
              >
                Quick entry
              </Link>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                Add record
              </Button>
            </div>
          ) : null
        }
      />

      <ModuleTabs
        items={[
          { href: "/milk", label: "Production", exact: true },
          { href: "/milk/feed", label: "Feed" },
        ]}
      />

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">30-day production</h2>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="liters"
                stroke="var(--color-secondary)"
                fill="var(--color-secondary)"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {milk.list.isLoading ? <LoadingState /> : null}
      {milk.list.isError ? (
        <ErrorState message="Failed to load milk records." onRetry={() => milk.list.refetch()} />
      ) : null}
      {!milk.list.isLoading && rows.length === 0 ? (
        <EmptyState icon={MilkIcon} title="No milk records" description="Start logging daily yields." />
      ) : null}

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
          >
            <div>
              <p className="font-medium">{row.cattle_tag}</p>
              <p className="text-xs text-muted-foreground">{row.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{formatLiters(row.total_liters)}</p>
              {showValue ? (
                <p className="text-xs text-muted-foreground">
                  ≈ {formatMoney(Number(row.total_liters) * milkPrice, milkCurrency)}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log milk">
        <Formik
          initialValues={{
            cattle: cattleOptions[0]?.value || "",
            date: new Date().toISOString().slice(0, 10),
            morning_liters: 0,
            evening_liters: 0,
            notes: "",
          }}
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
                label="Cattle"
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
                  label="Morning (L)"
                  name="morning_liters"
                  type="number"
                  step="0.1"
                  value={values.morning_liters}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label="Evening (L)"
                  name="evening_liters"
                  type="number"
                  step="0.1"
                  value={values.evening_liters}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <Textarea
                label="Notes"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={milk.create.isPending}>
                Save record
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
