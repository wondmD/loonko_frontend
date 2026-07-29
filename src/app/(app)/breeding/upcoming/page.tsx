"use client";

import { CalendarClock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ModuleTabs } from "@/components/ui/module-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { BREEDING_TABS } from "@/features/breeding/breeding-tabs";
import { useBreeding } from "@/features/breeding/hooks/use-breeding";
import type { BreedingUpcomingItem } from "@/types";

function formatShortDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function pregnancyTone(state: string) {
  if (state === "pregnant") return "accent" as const;
  if (state === "unconfirmed") return "warning" as const;
  return "default" as const;
}

function TaskSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: BreedingUpcomingItem[];
  tone?: "danger" | "warning" | "default";
}) {
  if (items.length === 0) return null;
  return (
    <section className="mb-6">
      <h2 className="mb-3 font-display text-lg font-semibold">{title}</h2>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <Link
            key={`${item.id ?? "d"}-${item.cattle}-${item.due_date}-${idx}`}
            href={`/breeding/${item.cattle}`}
            className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/30"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{item.cattle_number}</p>
                <Badge tone={pregnancyTone(item.pregnancy_state)}>
                  {item.pregnancy_state_label}
                </Badge>
                {item.is_derived ? <Badge>Suggested</Badge> : null}
              </div>
              <p className="mt-1 text-sm">{item.event_title || item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`text-sm font-semibold ${
                  tone === "danger"
                    ? "text-danger"
                    : tone === "warning"
                      ? "text-warning"
                      : "text-foreground"
                }`}
              >
                {formatShortDate(item.due_date)}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.is_overdue || item.days_until < 0
                  ? `${Math.abs(item.days_until)}d overdue`
                  : item.days_until === 0
                    ? "today"
                    : `in ${item.days_until}d`}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                {item.priority}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function BreedingUpcomingPage() {
  const breeding = useBreeding();
  const board = breeding.upcoming.data;
  const empty =
    !board ||
    (board.counts.overdue === 0 &&
      board.counts.due_today === 0 &&
      board.counts.upcoming === 0);

  return (
    <div>
      <PageHeader
        title="Breeding"
        description="Heat watch, pregnancy checks, dry-off, and calving coming up."
      />
      <ModuleTabs items={BREEDING_TABS} />

      {breeding.upcoming.isLoading ? <LoadingState /> : null}
      {breeding.upcoming.isError ? (
        <ErrorState
          message="Failed to load upcoming breeding tasks."
          onRetry={() => breeding.upcoming.refetch()}
        />
      ) : null}

      {board ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <StatCard label="Overdue" value={String(board.counts.overdue)} hint="Needs attention" />
          <StatCard label="Due today" value={String(board.counts.due_today)} />
          <StatCard
            label="Upcoming"
            value={String(board.counts.upcoming)}
            hint={`Next ${board.days} days`}
          />
        </div>
      ) : null}

      {!breeding.upcoming.isLoading && empty ? (
        <EmptyState
          icon={CalendarClock}
          title="Nothing breeding-related due"
          description="When heat windows, pregnancy checks, or calving approach, they show here."
        />
      ) : null}

      {board ? (
        <>
          <TaskSection title="Overdue" items={board.overdue} tone="danger" />
          <TaskSection title="Due today" items={board.due_today} tone="warning" />
          <TaskSection title="Upcoming" items={board.upcoming} />
        </>
      ) : null}
    </div>
  );
}
