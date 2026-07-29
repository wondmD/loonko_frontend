import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 rounded-2xl bg-muted p-3 text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-base text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      <p className="sr-only">{label}</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6 text-center">
      <h3 className="font-display text-xl font-semibold text-danger">{title}</h3>
      {message ? <p className="mt-2 text-base text-muted-foreground">{message}</p> : null}
      {onRetry ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
