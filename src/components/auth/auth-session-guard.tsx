"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { getAccessToken, getRefreshToken } from "@/lib/auth/token";
import { useAuthStore } from "@/stores/auth-store";

/**
 * If the UI thinks you're logged in on /register but tokens are gone,
 * clear the stale flag so registration isn't blocked.
 */
export function AuthSessionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, logout } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    const onRegister =
      pathname === "/register" || Boolean(pathname?.startsWith("/register/"));
    if (!onRegister || !isAuthenticated) return;
    if (!getAccessToken() && !getRefreshToken()) {
      logout();
    }
  }, [isHydrated, isAuthenticated, pathname, logout]);

  return children;
}
