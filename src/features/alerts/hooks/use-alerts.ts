"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { alertsApi } from "@/lib/api/services";

export function useAlerts() {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["alerts", "list"],
    queryFn: () => alertsApi.list(),
  });

  const unread = useQuery({
    queryKey: ["alerts", "unread"],
    queryFn: () => alertsApi.unreadCount(),
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: alertsApi.markRead,
    meta: { successMessage: "Alert marked read" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const acknowledge = useMutation({
    mutationFn: alertsApi.acknowledge,
    meta: { successMessage: "Alert acknowledged" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const generate = useMutation({
    mutationFn: alertsApi.generate,
    meta: { successMessage: "Due alerts refreshed" },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["husbandry"] });
    },
  });

  return { list, unread, markRead, acknowledge, generate };
}
