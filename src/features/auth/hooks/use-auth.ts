"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { authApi, unwrapList } from "@/lib/api/services";
import { normalizeApiError } from "@/lib/api/client";
import { getRefreshToken } from "@/lib/auth/token";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiErrorShape, User } from "@/types";

const AUTH_PUBLIC_PATHS = ["/login", "/register"];

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isHydrated, setSession, setUser, logout } =
    useAuthStore();

  const onAuthPublicPage = AUTH_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname?.startsWith(`${path}/`),
  );

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: isHydrated && isAuthenticated && !onAuthPublicPage,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.data) setUser(meQuery.data);
  }, [meQuery.data, setUser]);

  useEffect(() => {
    if (meQuery.isError) {
      logout();
    }
  }, [meQuery.isError, logout]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    meta: { successMessage: "Welcome back" },
    onSuccess: (data) => {
      setSession(data.user, data.access, data.refresh);
      router.replace("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    meta: { successMessage: "Farm account created" },
    onSuccess: (data) => {
      setSession(data.user, data.access, data.refresh);
      router.replace("/dashboard");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateMe,
    meta: { successMessage: "Profile updated" },
    onSuccess: (data) => {
      setUser(data);
      queryClient.setQueryData(["auth", "me"], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          await authApi.logout(refresh);
        } catch {
          // ignore logout API failures
        }
      }
    },
    meta: { successMessage: "Signed out", silent: false },
    onSettled: () => {
      logout();
      router.replace("/login");
    },
  });

  return {
    user,
    isAuthenticated,
    isHydrated,
    isLoadingMe: meQuery.isLoading,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error as ApiErrorShape | null,
    loginPending: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error as ApiErrorShape | null,
    registerPending: registerMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfilePending: updateProfileMutation.isPending,
    logout: logoutMutation.mutate,
  };
}

export function useStaff() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["staff"],
    queryFn: async () => unwrapList(await authApi.listStaff()),
  });

  const create = useMutation({
    mutationFn: authApi.createStaff,
    meta: { successMessage: "Staff member added" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => authApi.deleteStaff(id),
    meta: { successMessage: "Staff member removed" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
  });

  return { ...query, create, remove };
}

export function getMutationError(error: unknown): ApiErrorShape {
  return normalizeApiError(error);
}

export type { User };
