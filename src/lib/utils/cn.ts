import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function displayName(user: {
  first_name?: string;
  last_name?: string;
  email: string;
}) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || user.email;
}

export function formatLiters(value: string | number | null | undefined) {
  const n = Number(value ?? 0);
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} L`;
}

export function formatMoney(value: string | number | null | undefined, currency = "ETB") {
  const n = Number(value ?? 0);
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
}
