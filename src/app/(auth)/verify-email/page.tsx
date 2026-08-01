"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const { verifyEmail } = useAuth();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      setErrorMsg("Invalid or missing verification link.");
      return;
    }

    verifyEmail({ uid, token })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.response?.data?.detail || "Verification failed. The link may have expired.");
      });
  }, [uid, token, verifyEmail]);

  return (
    <Card className="border-white/10 bg-card/95 shadow-[var(--shadow-md)] backdrop-blur text-center">
      <CardHeader>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
          {status === "success" && <CheckCircle2 className="h-8 w-8 text-primary" />}
          {status === "error" && <XCircle className="h-8 w-8 text-danger" />}
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
          {status === "loading" && "Verifying Email"}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "loading" && (
          <p className="text-muted-foreground">Please wait while we verify your email address...</p>
        )}
        {status === "success" && (
          <>
            <p className="text-muted-foreground">Your account has been successfully verified. You can now log in.</p>
            <Link href="/login" className="inline-block w-full">
              <Button className="w-full">Continue to Login</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-danger">{errorMsg}</p>
            <Link href="/login" className="inline-block w-full">
              <Button variant="secondary" className="w-full">Return to Login</Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Card className="border-white/10 bg-card/95 shadow-[var(--shadow-md)] backdrop-blur text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">Verifying Email</h1>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please wait...</p>
        </CardContent>
      </Card>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
