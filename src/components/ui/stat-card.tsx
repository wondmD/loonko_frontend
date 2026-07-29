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
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          {hint ? (
            <p className="mt-1.5 text-xs text-muted-foreground/90 font-medium">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        ) : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </div>
  );
}
