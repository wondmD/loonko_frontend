"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/toaster";
import { normalizeApiError } from "@/lib/api/client";
import { useUiStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";

function ThemeSync({ children }: { children: ReactNode }) {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return children;
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _onMutateResult, mutation) => {
        const meta = mutation.meta;
        if (meta?.silent) return;
        if (meta?.successMessage) toast.success(meta.successMessage);
      },
      onError: (error, _variables, _onMutateResult, mutation) => {
        const meta = mutation.meta;
        if (meta?.silent) return;
        const message = meta?.errorMessage || normalizeApiError(error).message;
        toast.error(message || "Something went wrong");
      },
    }),
  });
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={client}>
      <ThemeSync>
        {children}
        <Toaster />
      </ThemeSync>
    </QueryClientProvider>
  );
}
