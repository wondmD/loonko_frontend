"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { milkApi } from "@/lib/api/services";
import { invalidateFarmModules } from "@/lib/query/invalidate";

export function useFeed() {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["milk", "feed"],
    queryFn: () => milkApi.listFeed(),
  });

  const create = useMutation({
    mutationFn: milkApi.createFeed,
    meta: { successMessage: "Feed log saved" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const remove = useMutation({
    mutationFn: milkApi.removeFeed,
    meta: { successMessage: "Feed log removed" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  return { list, create, remove };
}
