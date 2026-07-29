import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  className,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          typeof eyebrow === "string" ? (
            <p className="mb-1 text-xs font-bold tracking-widest text-primary uppercase">
              {eyebrow}
            </p>
          ) : (
            <div className="mb-1">{eyebrow}</div>
          )
        ) : null}
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
