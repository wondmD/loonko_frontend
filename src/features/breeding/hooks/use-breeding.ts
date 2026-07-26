"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { breedingApi } from "@/lib/api/services";
import { invalidateFarmModules } from "@/lib/query/invalidate";

export function useBreeding() {
  const queryClient = useQueryClient();

  const events = useQuery({
    queryKey: ["breeding", "events"],
    queryFn: () => breedingApi.listEvents(),
  });

  const pregnancies = useQuery({
    queryKey: ["breeding", "pregnancies"],
    queryFn: () => breedingApi.listPregnancies(),
  });

  const births = useQuery({
    queryKey: ["breeding", "births"],
    queryFn: () => breedingApi.listBirths(),
  });

  const createEvent = useMutation({
    mutationFn: breedingApi.createEvent,
    meta: { successMessage: "Breeding event saved" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const createPregnancy = useMutation({
    mutationFn: breedingApi.createPregnancy,
    meta: { successMessage: "Pregnancy recorded" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const updatePregnancy = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      breedingApi.updatePregnancy(id, payload),
    meta: { successMessage: "Pregnancy updated" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const createBirth = useMutation({
    mutationFn: breedingApi.createBirth,
    meta: { successMessage: "Calving recorded" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  return {
    events,
    pregnancies,
    births,
    createEvent,
    createPregnancy,
    updatePregnancy,
    createBirth,
  };
}
