"use client";

import { Formik, Form } from "formik";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { loginSchema } from "@/features/auth/validation";
import { getMutationError } from "@/features/auth/hooks/use-auth";

export default function LoginPage() {
  const { login, loginPending } = useAuth();

  return (
    <Card className="border-white/10 bg-card/95 shadow-[var(--shadow-md)] backdrop-blur">
      <CardHeader>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-secondary uppercase">
          Sign in
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Continue managing milk, herd health, breeding, and husbandry.
        </p>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={async (values, helpers) => {
            try {
              await login(values);
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
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : undefined}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : undefined}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={loginPending}>
                Sign in
              </Button>
            </Form>
          )}
        </Formik>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          First time setup?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register owner
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
