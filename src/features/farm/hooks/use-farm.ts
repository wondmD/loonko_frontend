"use client";

import { useQuery } from "@tanstack/react-query";

import { farmApi } from "@/lib/api/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useFarm() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["farm"],
    queryFn: farmApi.get,
    retry: false,
  });

  const update = useMutation({
    mutationFn: farmApi.update,
    meta: { successMessage: "Farm settings saved" },
    onSuccess: (data) => {
      queryClient.setQueryData(["farm"], data);
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  return { ...query, update };
}
