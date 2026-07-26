import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

const tones = {
  default: "bg-muted text-muted-foreground ring-1 ring-border/60",
  success: "bg-success/12 text-success ring-1 ring-success/20",
  warning: "bg-warning/12 text-warning ring-1 ring-warning/20",
  danger: "bg-danger/12 text-danger ring-1 ring-danger/20",
  accent: "bg-accent/12 text-accent ring-1 ring-accent/25",
} as const;

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
