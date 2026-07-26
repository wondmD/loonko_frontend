"use client";

import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useCattle } from "@/features/cattle/hooks/use-cattle";
import { useMilk } from "@/features/milk/hooks/use-milk";

const schema = Yup.object({
  cattle: Yup.string().required("Select cattle"),
  date: Yup.string().required(),
  morning_liters: Yup.number().min(0).required(),
  evening_liters: Yup.number().min(0).required(),
});

function MilkNewForm() {
  const router = useRouter();
  const milk = useMilk();
  const cattle = useCattle({ status: "ACTIVE" });
  const options =
    cattle.list.data?.results.map((c) => ({
      label: `${c.tag_id}${c.name ? ` — ${c.name}` : ""}`,
      value: String(c.id),
    })) ?? [];

  return (
    <div>
      <PageHeader title="Quick milk entry" description="Optimized for fast mobile logging." />
      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">Today’s yield</h2>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              cattle: options[0]?.value || "",
              date: new Date().toISOString().slice(0, 10),
              morning_liters: 0,
              evening_liters: 0,
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
                });
                router.push("/milk");
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
                  options={[{ label: "Select…", value: "" }, ...options]}
                  error={touched.cattle ? errors.cattle : undefined}
                />
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={values.date}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
                {status ? <p className="text-sm text-danger">{status}</p> : null}
                <Button type="submit" className="w-full" size="lg" loading={milk.create.isPending}>
                  Save
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MilkNewPage() {
  return (
    <RequireAuth module="milkWrite">
      <MilkNewForm />
    </RequireAuth>
  );
}
