"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import type { HusbandryPlan, HusbandryWindow } from "@/types";

function toneForStatus(status: string) {
  if (status === "OVERDUE") return "danger" as const;
  if (status === "ACTIVE") return "warning" as const;
  if (status === "UPCOMING") return "accent" as const;
  return "default" as const;
}

function toneForSeverity(severity: string | null | undefined) {
  if (severity === "CRITICAL") return "danger" as const;
  if (severity === "WARNING") return "warning" as const;
  return "default" as const;
}

function WindowRow({ window }: { window: HusbandryWindow }) {
  return (
    <div className="rounded-xl border border-border/80 bg-muted/25 px-3.5 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold tracking-tight">{window.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{window.description}</p>
        </div>
        <Badge tone={toneForStatus(window.status)}>{window.status}</Badge>
      </div>
      {window.start && window.end ? (
        <p className="mt-2 text-sm">
          <span className="font-medium">{window.start}</span>
          <span className="text-muted-foreground"> → </span>
          <span className="font-medium">{window.end}</span>
          {window.ideal ? (
            <span className="text-muted-foreground"> · ideal {window.ideal}</span>
          ) : null}
        </p>
      ) : null}
      <p className="mt-1 text-xs text-muted-foreground">{window.message}</p>
    </div>
  );
}

export function HusbandryPlanPanel({ plan }: { plan?: HusbandryPlan | null }) {
  if (!plan) {
    return <EmptyState title="No husbandry plan" description="Not enough data yet." />;
  }

  const cls = plan.animal_class;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.15rem] border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Auto-detected class
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone="accent">{cls.category_label || cls.category || "—"}</Badge>
          <Badge>{cls.label}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{cls.basis}</p>
        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <p>
            Age:{" "}
            <span className="font-medium text-foreground">
              {cls.age_days != null
                ? `${cls.age_days}d${cls.age_months != null ? ` (~${cls.age_months} mo)` : ""}`
                : "unknown"}
            </span>
          </p>
          <p>
            Last calved:{" "}
            <span className="font-medium text-foreground">
              {cls.last_calving_date || "never"}
            </span>
          </p>
          <p>
            Last AI:{" "}
            <span className="font-medium text-foreground">
              {cls.last_insemination_date || "none"}
            </span>
          </p>
        </div>
      </div>

      {plan.warnings.length > 0 ? (
        <Card>
          <CardHeader>
            <h3 className="font-display text-base font-bold">Needs attention</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.warnings.map((w) => (
              <div
                key={w.code}
                className="rounded-xl border border-border px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{w.title}</p>
                  <Badge tone={toneForSeverity(w.severity)}>{w.severity}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{w.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <h3 className="font-display text-base font-bold">Suggested day ranges</h3>
          <p className="text-sm text-muted-foreground">
            Insemination, pregnancy check, dry-off, calving, and related windows from age and
            breeding history.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.windows.length === 0 ? (
            <EmptyState title="No windows yet" description="Add DOB or breeding records." />
          ) : (
            plan.windows.map((w) => <WindowRow key={`${w.key}-${w.start}`} window={w} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
