import type { ModuleKey, Role } from "@/types";

export const MODULE_ACCESS: Record<ModuleKey, readonly Role[]> = {
  dashboard: ["OWNER", "WORKER", "VETERINARIAN"],
  cattle: ["OWNER", "WORKER", "VETERINARIAN"],
  milk: ["OWNER", "WORKER", "VETERINARIAN"],
  health: ["OWNER", "WORKER", "VETERINARIAN"],
  breeding: ["OWNER", "WORKER", "VETERINARIAN"],
  husbandry: ["OWNER", "WORKER", "VETERINARIAN"],
  finance: ["OWNER"],
  settings: ["OWNER"],
  alerts: ["OWNER", "WORKER", "VETERINARIAN"],
  milkWrite: ["OWNER", "WORKER"],
  cattleWrite: ["OWNER", "WORKER"],
  healthWrite: ["OWNER", "WORKER", "VETERINARIAN"],
  breedingWrite: ["OWNER", "WORKER", "VETERINARIAN"],
  husbandryWrite: ["OWNER", "WORKER"],
} as const;

export function canAccess(role: Role | null | undefined, module: ModuleKey) {
  if (!role) return false;
  return MODULE_ACCESS[module].includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  WORKER: "Worker",
  VETERINARIAN: "Veterinarian",
};

export type NavGroup = "main" | "care" | "manage";

export const NAV_GROUPS: Array<{ id: NavGroup; label: string }> = [
  { id: "main", label: "Daily" },
  { id: "care", label: "Herd care" },
  { id: "manage", label: "Manage" },
];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", module: "dashboard" as const, icon: "LayoutDashboard", group: "main" as const },
  { href: "/cattle", label: "Herd", module: "cattle" as const, icon: "Beef", group: "main" as const },
  { href: "/milk", label: "Milk", module: "milk" as const, icon: "Milk", group: "main" as const },
  { href: "/husbandry", label: "Tasks", module: "husbandry" as const, icon: "CalendarClock", group: "care" as const },
  { href: "/health", label: "Health", module: "health" as const, icon: "HeartPulse", group: "care" as const },
  { href: "/breeding", label: "Breeding", module: "breeding" as const, icon: "Dna", group: "care" as const },
  { href: "/breeding/calving", label: "Calving", module: "breeding" as const, icon: "Baby", group: "care" as const },
  { href: "/finance", label: "Finance", module: "finance" as const, icon: "Wallet", group: "manage" as const },
  { href: "/alerts", label: "Alerts", module: "alerts" as const, icon: "Bell", group: "manage" as const },
  { href: "/settings", label: "Settings", module: "settings" as const, icon: "Settings", group: "manage" as const },
] as const;
