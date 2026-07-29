"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canAccess } from "@/lib/auth/access";
import { useTranslation } from "@/lib/i18n";
import { formatRelativeDays, translateDynamicText } from "@/lib/i18n/translate-dynamic";
import { useAuthStore } from "@/stores/auth-store";
import type { HusbandryTask } from "@/types";

import { useHusbandryActions } from "../hooks/use-husbandry";

function priorityTone(priority: HusbandryTask["priority"]) {
  if (priority === "CRITICAL") return "danger" as const;
  if (priority === "HIGH") return "warning" as const;
  if (priority === "LOW") return "default" as const;
  return "accent" as const;
}

export function HusbandryTaskRow({
  task,
  showCattle = true,
}: {
  task: HusbandryTask;
  showCattle?: boolean;
}) {
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = canAccess(role, "husbandryWrite");
  const { language, t } = useTranslation();
  const { complete, skip } = useHusbandryActions();

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{translateDynamicText(task.title, language)}</p>
            <Badge tone={priorityTone(task.priority)}>
              {translateDynamicText(task.task_type_label, language)}
            </Badge>
          </div>
          {showCattle ? (
            <Link
              href={`/cattle/${task.cattle}`}
              className="mt-1 inline-block text-sm text-primary hover:underline"
            >
              {task.cattle_tag}
            </Link>
          ) : null}
          {task.description ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {translateDynamicText(task.description, language)}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <Badge tone={task.is_overdue ? "danger" : task.days_until === 0 ? "warning" : "default"}>
            {task.due_date}
          </Badge>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatRelativeDays(task.days_until, language)}
          </p>
        </div>
      </div>
      {canWrite && task.status === "PENDING" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            loading={complete.isPending}
            onClick={() => complete.mutate({ id: task.id })}
          >
            {t("common.complete")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            loading={skip.isPending}
            onClick={() => skip.mutate({ id: task.id })}
          >
            {t("common.skip")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
