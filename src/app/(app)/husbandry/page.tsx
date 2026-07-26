"use client";

import { CalendarClock, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { HusbandryTaskRow } from "@/features/husbandry/components/husbandry-task-row";
import {
  useHusbandryActions,
  useHusbandryBoard,
} from "@/features/husbandry/hooks/use-husbandry";
import { canAccess } from "@/lib/auth/access";
import { useAuthStore } from "@/stores/auth-store";
import type { HusbandryTask } from "@/types";

export default function HusbandryPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canSync = role === "OWNER";
  const canWrite = canAccess(role, "husbandryWrite");
  const board = useHusbandryBoard(21);
  const { sync } = useHusbandryActions();

  if (board.isLoading) return <LoadingState />;
  if (board.isError || !board.data) {
    return <ErrorState message="Could not load husbandry board." onRetry={() => board.refetch()} />;
  }

  const { overdue, due_today, upcoming, counts } = board.data;
  const empty =
    overdue.length === 0 && due_today.length === 0 && upcoming.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Care calendar"
        title="Cattle husbandry"
        description="Automated female dairy lifecycle: rearing, heat, breeding, pregnancy, dry-off, calving, and fresh-cow care."
        actions={
          canSync ? (
            <Button
              variant="secondary"
              loading={sync.isPending}
              onClick={() => sync.mutate(undefined)}
            >
              <RefreshCw className="h-4 w-4" />
              Resync schedules
            </Button>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Overdue" value={String(counts.overdue)} hint="Needs attention now" />
        <StatCard label="Due today" value={String(counts.due_today)} />
        <StatCard label="Next 21 days" value={String(counts.upcoming)} />
      </div>

      {empty ? (
        <EmptyState
          icon={CalendarClock}
          title="No open husbandry tasks"
          description={
            canWrite
              ? "Add female cattle or log breeding/calving and the schedule will rebuild automatically."
              : "Nothing scheduled in the next three weeks."
          }
        />
      ) : null}

      <TaskSection title="Overdue" tasks={overdue} />
      <TaskSection title="Due today" tasks={due_today} />
      <TaskSection title="Upcoming" tasks={upcoming} />
    </div>
  );
}

function TaskSection({ title, tasks }: { title: string; tasks: HusbandryTask[] }) {
  if (tasks.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <HusbandryTaskRow key={task.id} task={task} />
        ))}
      </CardContent>
    </Card>
  );
}
