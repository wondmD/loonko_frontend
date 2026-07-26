"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { husbandryApi } from "@/lib/api/services";
import { invalidateFarmModules } from "@/lib/query/invalidate";

export function useHusbandryBoard(days = 14) {
  return useQuery({
    queryKey: ["husbandry", "board", days],
    queryFn: () => husbandryApi.board({ days }),
  });
}

export function useHusbandryActions() {
  const queryClient = useQueryClient();

  const complete = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      husbandryApi.complete(id, notes ?? ""),
    meta: { successMessage: "Task completed" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const skip = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      husbandryApi.skip(id, notes ?? ""),
    meta: { successMessage: "Task skipped" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const sync = useMutation({
    mutationFn: (cattleId?: number) =>
      husbandryApi.sync(cattleId ? { cattle_id: cattleId } : {}),
    meta: { successMessage: "Tasks refreshed" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  return { complete, skip, sync };
}
