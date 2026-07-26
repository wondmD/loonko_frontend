"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/ui/states";
import { canAccess } from "@/lib/auth/access";
import { useAuthStore } from "@/stores/auth-store";
import type { ModuleKey } from "@/types";

export function RequireAuth({
  children,
  module,
}: {
  children: ReactNode;
  module?: ModuleKey;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (module && user && !canAccess(user.role, module)) {
      router.replace("/dashboard");
    }
  }, [isHydrated, isAuthenticated, module, user, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <LoadingState label="Checking session…" />
      </div>
    );
  }

  if (module && user && !canAccess(user.role, module)) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <LoadingState label="Redirecting…" />
      </div>
    );
  }

  return children;
}
