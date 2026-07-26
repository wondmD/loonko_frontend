"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { milkApi } from "@/lib/api/services";
import { invalidateFarmModules } from "@/lib/query/invalidate";

export function useMilk(params?: Record<string, string | number | undefined>) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["milk", "records", params],
    queryFn: () => milkApi.list(params),
  });

  const summary = useQuery({
    queryKey: ["milk", "summary"],
    queryFn: () => milkApi.summary({ period: "day" }),
  });

  const trends = useQuery({
    queryKey: ["milk", "trends"],
    queryFn: () => milkApi.trends({ days: 30, group: "day" }),
  });

  const create = useMutation({
    mutationFn: milkApi.create,
    meta: { successMessage: "Milk record saved" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  return { list, summary, trends, create };
}
