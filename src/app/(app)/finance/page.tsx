"use client";

import { Form, Formik } from "formik";
import { Plus } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { RequireAuth } from "@/components/auth/require-auth";
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
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useFinance } from "@/features/finance/hooks/use-finance";
import { formatMoney } from "@/lib/utils/cn";

const schema = Yup.object({
  type: Yup.string().required(),
  category: Yup.string().required(),
  amount: Yup.number().positive().required(),
  date: Yup.string().required(),
  description: Yup.string(),
});

import { useTranslation } from "@/lib/i18n";

function FinanceContent() {
  const [open, setOpen] = useState(false);
  const finance = useFinance();
  const { t } = useTranslation();
  const rows = finance.list.data?.results ?? [];
  const chartData =
    finance.byCategory.data?.breakdown.map((b) => ({
      name: `${b.type.slice(0, 1)}:${b.category}`,
      total: Number(b.total),
    })) ?? [];

  return (
    <div>
      <PageHeader
        title={t("finance.title")}
        description={t("finance.subtitle")}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("finance.addTransaction")}
          </Button>
        }
      />

      {finance.summary.isLoading ? <LoadingState /> : null}
      {finance.summary.isError ? (
        <ErrorState
          message="Failed to load finance summary."
          onRetry={() => finance.summary.refetch()}
        />
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("finance.income")}
          value={formatMoney(finance.summary.data?.income, finance.summary.data?.currency)}
          hint={
            finance.summary.data?.mode === "CASH"
              ? "Cash sales + other income"
              : "Production + other (excludes cash sales)"
          }
        />
        <StatCard
          label={t("finance.expense")}
          value={formatMoney(finance.summary.data?.expense, finance.summary.data?.currency)}
        />
        <StatCard
          label={t("finance.netProfit")}
          value={formatMoney(finance.summary.data?.profit, finance.summary.data?.currency)}
        />
      </div>

      {finance.summary.data?.milk ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Milk liters (30d)"
            value={`${Number(finance.summary.data.milk.liters).toFixed(1)} L`}
            hint={`× ${finance.summary.data.milk.price_per_liter} ${finance.summary.data.milk.currency}/L`}
          />
          <StatCard
            label="Production value"
            value={formatMoney(
              finance.summary.data.milk.valued_income,
              finance.summary.data.milk.currency,
            )}
            hint={
              finance.summary.data.milk.auto_enabled
                ? "Booked in accrual mode"
                : "Informational"
            }
          />
          <StatCard
            label="Auto income booked"
            value={formatMoney(
              finance.summary.data.milk.auto_income_booked,
              finance.summary.data.milk.currency,
            )}
          />
          <StatCard
            label={t("finance.milkSalesRevenue")}
            value={formatMoney(
              finance.summary.data.milk.cash_sales,
              finance.summary.data.milk.currency,
            )}
            hint={
              finance.summary.data.mode === "ACCRUAL"
                ? "Excluded from profit in accrual mode"
                : "Included in profit"
            }
          />
        </div>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">{t("finance.category")}</h2>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="No transactions"
          description="Milk production income appears automatically when you log milk. Add expenses and cash sales here."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-medium">{row.description || row.category}</p>
                <p className="text-xs text-muted-foreground">
                  {row.date}
                  {row.is_auto ? " · Auto from milk production" : ""}
                </p>
              </div>
              <div className="text-right">
                <div className="flex flex-wrap items-center justify-end gap-1">
                  {row.is_auto ? <Badge>Auto</Badge> : null}
                  <Badge tone={row.type === "INCOME" ? "success" : "warning"}>{row.type}</Badge>
                </div>
                <p className="mt-1 text-sm font-semibold">{formatMoney(row.amount, row.currency)}</p>
                {!row.is_auto ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1"
                    loading={finance.remove.isPending}
                    onClick={() => finance.remove.mutate(row.id)}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t("finance.addTransaction")}>
        <Formik
          initialValues={{
            type: "EXPENSE",
            category: "feed",
            amount: 0,
            date: new Date().toISOString().slice(0, 10),
            description: "",
          }}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              await finance.create.mutateAsync({
                type: values.type as "INCOME" | "EXPENSE",
                category: values.category,
                amount: String(values.amount),
                date: values.date,
                description: values.description,
                currency: finance.summary.data?.currency || "ETB",
              });
              setOpen(false);
            } catch (error) {
              helpers.setStatus(getMutationError(error).message);
            }
          }}
        >
          {({ values, handleChange, handleBlur, status }) => (
            <Form className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Daily milk production is booked automatically from Settings. Use this form for
                expenses and optional cash milk sales.
              </p>
              <Select
                label="Type"
                name="type"
                value={values.type}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[
                  { label: t("finance.income"), value: "INCOME" },
                  { label: t("finance.expense"), value: "EXPENSE" },
                ]}
              />
              <Select
                label={t("finance.category")}
                name="category"
                value={values.category}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[
                  { label: t("finance.milkSales"), value: "milk_sale" },
                  { label: t("finance.feedCost"), value: "feed" },
                  { label: t("finance.vetCost"), value: "vet" },
                  { label: "Labor", value: "labor" },
                  { label: t("finance.equipmentCost"), value: "maintenance" },
                  { label: t("finance.other"), value: "other" },
                ]}
              />
              <Input
                label={`${t("finance.amount")} (${finance.summary.data?.currency || "ETB"})`}
                name="amount"
                type="number"
                value={values.amount}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Input
                label="Date"
                name="date"
                type="date"
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Textarea
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={finance.create.isPending}>
                {t("common.save")}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}

export default function FinancePage() {
  return (
    <RequireAuth module="finance">
      <FinanceContent />
    </RequireAuth>
  );
}
