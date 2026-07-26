import type { MutationMeta } from "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      successMessage?: string;
      errorMessage?: string;
      /** Skip automatic success/error toasts */
      silent?: boolean;
    };
  }
}

export type AppMutationMeta = MutationMeta;
