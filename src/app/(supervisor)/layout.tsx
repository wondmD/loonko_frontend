"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export default function SupervisorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isHydrated, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (!user?.is_superuser) {
        router.replace("/dashboard");
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated || !isAuthenticated || !user?.is_superuser) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-muted/40">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 px-6 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size={32} />
            <h1 className="font-display text-xl font-bold tracking-tight">Supervisor Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                Back to App
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
