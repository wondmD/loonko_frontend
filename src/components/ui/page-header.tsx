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
  eyebrow?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
