"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { healthApi } from "@/lib/api/services";
import { invalidateFarmModules } from "@/lib/query/invalidate";

export function useHealth() {
  const queryClient = useQueryClient();

  const records = useQuery({
    queryKey: ["health", "records"],
    queryFn: () => healthApi.listRecords(),
  });

  const vaccinations = useQuery({
    queryKey: ["health", "vaccinations"],
    queryFn: () => healthApi.listVaccinations(),
  });

  const treatments = useQuery({
    queryKey: ["health", "treatments"],
    queryFn: () => healthApi.listTreatments(),
  });

  const upcoming = useQuery({
    queryKey: ["health", "upcoming"],
    queryFn: () => healthApi.upcomingVaccinations(),
  });

  const createRecord = useMutation({
    mutationFn: healthApi.createRecord,
    meta: { successMessage: "Health record saved" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const createVaccination = useMutation({
    mutationFn: healthApi.createVaccination,
    meta: { successMessage: "Vaccination saved" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const createTreatment = useMutation({
    mutationFn: healthApi.createTreatment,
    meta: { successMessage: "Treatment saved" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  return {
    records,
    vaccinations,
    treatments,
    upcoming,
    createRecord,
    createVaccination,
    createTreatment,
  };
}
