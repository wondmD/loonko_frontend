"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { financeApi } from "@/lib/api/services";
import { invalidateFarmModules } from "@/lib/query/invalidate";

export function useFinance() {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["finance", "transactions"],
    queryFn: () => financeApi.list(),
  });

  const summary = useQuery({
    queryKey: ["finance", "summary"],
    queryFn: () => financeApi.summary({ days: 30 }),
  });

  const byCategory = useQuery({
    queryKey: ["finance", "by-category"],
    queryFn: () => financeApi.byCategory({ days: 30 }),
  });

  const create = useMutation({
    mutationFn: financeApi.create,
    meta: { successMessage: "Transaction saved" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const remove = useMutation({
    mutationFn: financeApi.remove,
    meta: { successMessage: "Transaction removed" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  return { list, summary, byCategory, create, remove };
}
