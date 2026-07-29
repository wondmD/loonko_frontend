import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

const tones = {
  default: "bg-muted/80 text-muted-foreground border border-border/60",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  danger: "bg-danger/15 text-danger border border-danger/30",
  accent: "bg-accent/15 text-accent border border-accent/30",
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
