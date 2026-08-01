"use client";

import { Form, Formik } from "formik";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import * as Yup from "yup";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/use-auth";

const setPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

function SetPasswordContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const { setPassword, setPasswordPending } = useAuth();
  const [success, setSuccess] = useState(false);

  if (!uid || !token) {
    return (
      <Card className="border-white/10 bg-card/95 shadow-[var(--shadow-md)] backdrop-blur text-center">
        <CardHeader>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-danger">Invalid Link</h1>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">This invitation link is missing required parameters.</p>
          <Link href="/login" className="inline-block w-full">
            <Button variant="secondary" className="w-full">Return to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="border-white/10 bg-card/95 shadow-[var(--shadow-md)] backdrop-blur text-center">
        <CardHeader>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-primary">Password Set!</h1>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">Your password has been saved. You can now log in to access the farm dashboard.</p>
          <Link href="/login" className="inline-block w-full">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-card/95 shadow-[var(--shadow-md)] backdrop-blur">
      <CardHeader>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight">Set Your Password</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Welcome to the farm! Please set a secure password for your account to continue.
        </p>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={setPasswordSchema}
          onSubmit={async (values, helpers) => {
            try {
              await setPassword({ uid, token, password: values.password });
              setSuccess(true);
            } catch (error: any) {
              helpers.setStatus(error.response?.data?.detail || "Failed to set password. The link might be expired.");
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, status }) => (
            <Form className="space-y-4">
              <Input
                label="New Password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : undefined}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={setPasswordPending}>
                Save Password
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <Card className="border-white/10 bg-card/95 shadow-[var(--shadow-md)] backdrop-blur text-center">
        <CardHeader>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">Loading...</h1>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">Please wait while we load the page.</p>
        </CardContent>
      </Card>
    }>
      <SetPasswordContent />
    </Suspense>
  );
}
