"use client";

import { Form, Formik } from "formik";
import * as Yup from "yup";

import { RequireAuth } from "@/components/auth/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import { getMutationError, useStaff } from "@/features/auth/hooks/use-auth";
import { staffSchema } from "@/features/auth/validation";
import { useFarm } from "@/features/farm/hooks/use-farm";
import { ROLE_LABELS } from "@/lib/auth/access";

const farmSchema = Yup.object({
  name: Yup.string().required(),
  location: Yup.string(),
  region: Yup.string(),
  woreda: Yup.string(),
  phone: Yup.string(),
  notes: Yup.string(),
});

const pricingSchema = Yup.object({
  milk_price_per_liter: Yup.number().min(0).required("Milk price is required"),
  currency: Yup.string().required(),
  milk_income_mode: Yup.string().oneOf(["ACCRUAL", "CASH"]).required(),
  auto_milk_income: Yup.boolean(),
});

function SettingsContent() {
  const farm = useFarm();
  const staff = useStaff();

  if (farm.isLoading) return <LoadingState />;
  if (farm.isError) {
    return <ErrorState message="Failed to load farm profile." onRetry={() => farm.refetch()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Farm profile, milk pricing, and staff for your farm."
      />

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">Milk pricing</h2>
          <p className="text-sm text-muted-foreground">
            Choose how milk income hits profit: value daily production (accrual) or cash sales only.
          </p>
        </CardHeader>
        <CardContent>
          <Formik
            enableReinitialize
            initialValues={{
              milk_price_per_liter: Number(farm.data?.milk_price_per_liter ?? 40),
              currency: farm.data?.currency || "ETB",
              milk_income_mode: farm.data?.milk_income_mode || "ACCRUAL",
              auto_milk_income: farm.data?.auto_milk_income ?? true,
            }}
            validationSchema={pricingSchema}
            onSubmit={async (values, helpers) => {
              try {
                await farm.update.mutateAsync({
                  milk_price_per_liter: values.milk_price_per_liter,
                  currency: values.currency,
                  milk_income_mode: values.milk_income_mode as "ACCRUAL" | "CASH",
                  auto_milk_income: values.auto_milk_income,
                });
                helpers.setStatus("Pricing saved — finance income recalculated");
              } catch (error) {
                helpers.setStatus(getMutationError(error).message);
              }
            }}
          >
            {({ values, handleChange, handleBlur, setFieldValue, status, errors, touched }) => (
              <Form className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Price per liter"
                  name="milk_price_per_liter"
                  type="number"
                  step="0.01"
                  value={values.milk_price_per_liter}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.milk_price_per_liter ? errors.milk_price_per_liter : undefined}
                />
                <Input
                  label="Currency"
                  name="currency"
                  value={values.currency}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.currency ? errors.currency : undefined}
                />
                <div className="sm:col-span-2">
                  <Select
                    label="Income mode"
                    name="milk_income_mode"
                    value={values.milk_income_mode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={[
                      {
                        label: "Accrual — value daily production toward profit",
                        value: "ACCRUAL",
                      },
                      {
                        label: "Cash — only milk cash sales toward profit",
                        value: "CASH",
                      },
                    ]}
                  />
                </div>
                {values.milk_income_mode === "ACCRUAL" ? (
                  <label className="sm:col-span-2 flex items-start gap-3 rounded-xl border border-border px-3 py-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                      checked={values.auto_milk_income}
                      onChange={(e) => setFieldValue("auto_milk_income", e.target.checked)}
                    />
                    <span>
                      <span className="font-medium">Auto-book production as income</span>
                      <span className="mt-0.5 block text-muted-foreground">
                        Liters × price creates finance income. Cash milk sales are tracked
                        separately and do not double-count profit in accrual mode.
                      </span>
                    </span>
                  </label>
                ) : (
                  <p className="sm:col-span-2 text-sm text-muted-foreground">
                    Cash mode: record milk buyer payments under Finance → Milk cash sale. Production
                    value stays informational only.
                  </p>
                )}
                <div className="sm:col-span-2 flex items-center gap-3">
                  <Button type="submit" loading={farm.update.isPending}>
                    Save pricing
                  </Button>
                  {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">Farm profile</h2>
        </CardHeader>
        <CardContent>
          <Formik
            enableReinitialize
            initialValues={{
              name: farm.data?.name || "",
              location: farm.data?.location || "",
              region: farm.data?.region || "",
              woreda: farm.data?.woreda || "",
              phone: farm.data?.phone || "",
              notes: farm.data?.notes || "",
            }}
            validationSchema={farmSchema}
            onSubmit={async (values, helpers) => {
              try {
                await farm.update.mutateAsync(values);
                helpers.setStatus("Saved");
              } catch (error) {
                helpers.setStatus(getMutationError(error).message);
              }
            }}
          >
            {({ values, handleChange, handleBlur, status, errors, touched }) => (
              <Form className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name ? errors.name : undefined}
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label="Location"
                  name="location"
                  value={values.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label="Region"
                  name="region"
                  value={values.region}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label="Woreda"
                  name="woreda"
                  value={values.woreda}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <div className="sm:col-span-2">
                  <Textarea
                    label="Notes"
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <Button type="submit" loading={farm.update.isPending}>
                    Save profile
                  </Button>
                  {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">Staff</h2>
          <p className="text-sm text-muted-foreground">Invite workers and veterinarians.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Formik
            initialValues={{
              email: "",
              password: "",
              first_name: "",
              last_name: "",
              role: "WORKER" as const,
            }}
            validationSchema={staffSchema}
            onSubmit={async (values, helpers) => {
              try {
                await staff.create.mutateAsync(values);
                helpers.resetForm();
                helpers.setStatus("Staff member created");
              } catch (error) {
                helpers.setStatus(getMutationError(error).message);
              }
            }}
          >
            {({ values, handleChange, handleBlur, status, errors, touched }) => (
              <Form className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  name="first_name"
                  value={values.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.first_name ? errors.first_name : undefined}
                />
                <Input
                  label="Last name"
                  name="last_name"
                  value={values.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email ? errors.email : undefined}
                />
                <Input
                  label="Temp password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password ? errors.password : undefined}
                />
                <Select
                  label="Role"
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={[
                    { label: "Worker", value: "WORKER" },
                    { label: "Veterinarian", value: "VETERINARIAN" },
                  ]}
                />
                <div className="flex items-end gap-3">
                  <Button type="submit" loading={staff.create.isPending}>
                    Invite staff
                  </Button>
                  {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
                </div>
              </Form>
            )}
          </Formik>

          <div className="space-y-2">
            {(staff.data ?? []).map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{ROLE_LABELS[member.role]}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => staff.remove.mutate(member.id)}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth module="settings">
      <SettingsContent />
    </RequireAuth>
  );
}
