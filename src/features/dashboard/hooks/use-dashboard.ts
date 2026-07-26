"use client";

import { useAlerts } from "@/features/alerts/hooks/use-alerts";
import { useBreeding } from "@/features/breeding/hooks/use-breeding";
import { useCattle } from "@/features/cattle/hooks/use-cattle";
import { useFinance } from "@/features/finance/hooks/use-finance";
import { useHealth } from "@/features/health/hooks/use-health";
import { useHusbandryBoard } from "@/features/husbandry/hooks/use-husbandry";
import { useMilk } from "@/features/milk/hooks/use-milk";
import { useAuthStore } from "@/stores/auth-store";

export function useDashboard() {
  const role = useAuthStore((s) => s.user?.role);
  const milk = useMilk();
  const cattle = useCattle({ status: "ACTIVE" });
  const health = useHealth();
  const breeding = useBreeding();
  const alerts = useAlerts();
  const finance = useFinance();
  const husbandry = useHusbandryBoard(14);

  return {
    role,
    milk,
    cattle,
    health,
    breeding,
    alerts,
    husbandry,
    finance: role === "OWNER" ? finance : null,
  };
}
