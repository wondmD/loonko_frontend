"use client";

import { Form, Formik } from "formik";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMutationError, useAuth } from "@/features/auth/hooks/use-auth";
import { registerSchema } from "@/features/auth/validation";

export default function RegisterPage() {
  const { register, registerPending } = useAuth();

  return (
    <Card className="border-white/10 bg-card/95 shadow-[var(--shadow-md)] backdrop-blur">
      <CardHeader>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-secondary uppercase">
          Setup
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
          Create your farm
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Create your farm and owner account to start tracking herd, milk, and care.
        </p>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            email: "",
            password: "",
            first_name: "",
            last_name: "",
            phone: "",
            farm_name: "",
          }}
          validationSchema={registerSchema}
          onSubmit={async (values, helpers) => {
            try {
              await register(values);
            } catch (error) {
              const err = getMutationError(error);
              helpers.setStatus(err.message);
              helpers.setErrors(
                Object.fromEntries(
                  Object.entries(err.fieldErrors).map(([k, v]) => [k, v[0]]),
                ),
              );
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, status }) => (
            <Form className="space-y-4">
              <Input
                label="Farm name"
                name="farm_name"
                value={values.farm_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.farm_name ? errors.farm_name : undefined}
              />
              <div className="grid gap-4 sm:grid-cols-2">
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
                  error={touched.last_name ? errors.last_name : undefined}
                />
              </div>
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
                label="Phone"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phone ? errors.phone : undefined}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : undefined}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={registerPending}>
                Create account
              </Button>
            </Form>
          )}
        </Formik>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already set up?{" "}
          <Link href="/login" className="font-medium text-primary">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
