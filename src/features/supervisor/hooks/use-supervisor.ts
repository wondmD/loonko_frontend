"use client";

import { useQuery } from "@tanstack/react-query";
import { farmApi } from "@/lib/api/services";

export function useSupervisor() {
  const analytics = useQuery({
    queryKey: ["supervisor", "analytics"],
    queryFn: farmApi.supervisor,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
  });

  return { analytics };
}
