"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cattleApi } from "@/lib/api/services";
import { invalidateFarmModules } from "@/lib/query/invalidate";
import type { CattleDetail } from "@/types";

export function useCattle(params?: Record<string, string | number | undefined>) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["cattle", params],
    queryFn: () => cattleApi.list(params),
  });

  const facets = useQuery({
    queryKey: ["cattle", "facets", params],
    queryFn: () => cattleApi.facets(params),
  });

  const create = useMutation({
    mutationFn: (payload: FormData | Record<string, unknown>) => cattleApi.create(payload),
    meta: { successMessage: "Animal added" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: FormData | Record<string, unknown>;
    }) => cattleApi.update(id, payload),
    meta: { successMessage: "Animal updated" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  const remove = useMutation({
    mutationFn: (id: number) => cattleApi.remove(id),
    meta: { successMessage: "Animal removed" },
    onSuccess: () => invalidateFarmModules(queryClient),
  });

  return { list, facets, create, update, remove };
}

export function useCattleDetail(id: number) {
  return useQuery({
    queryKey: ["cattle", id],
    queryFn: () => cattleApi.get(id) as Promise<CattleDetail>,
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function buildCattleFormData(
  values: Record<string, string | number | boolean | null | undefined>,
  photos?: {
    photo_front?: File | null;
    photo_left?: File | null;
    photo_right?: File | null;
  },
) {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    
    // Explicitly handle "mother" / "father" fields depending on whether they are set
    // The UI may pass mother=null but mother_external_id="External Cow"
    form.append(key, String(value));
  });
  if (photos?.photo_front) form.append("photo_front", photos.photo_front);
  if (photos?.photo_left) form.append("photo_left", photos.photo_left);
  if (photos?.photo_right) form.append("photo_right", photos.photo_right);
  return form;
}
