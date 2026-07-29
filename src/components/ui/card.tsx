import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card text-card-foreground shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("space-y-1.5 px-6 pt-6 pb-4", className)}>{children}</div>;
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("px-6 pb-6", className)}>{children}</div>;
}
