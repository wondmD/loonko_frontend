"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function VerifyPendingPage() {
  return (
    <Card className="border-white/10 bg-card/95 shadow-[var(--shadow-md)] backdrop-blur text-center">
      <CardHeader>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
          Check your email
        </h1>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          We've sent a verification link to your email address. Please click the link to activate your account and start managing your farm.
        </p>
        <Link href="/login" className="inline-block w-full">
          <Button variant="secondary" className="w-full">
            Return to Login
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
