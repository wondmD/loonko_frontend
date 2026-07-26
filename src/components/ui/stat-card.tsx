import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)] sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-bold tracking-tight">{value}</p>
          {hint ? (
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-xl bg-muted p-2 text-muted-foreground">
            <Icon className="h-4 w-4" strokeWidth={1.85} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
