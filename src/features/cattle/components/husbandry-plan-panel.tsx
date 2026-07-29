"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { useTranslation } from "@/lib/i18n";
import { translateDynamicText } from "@/lib/i18n/translate-dynamic";
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
  const { language, t } = useTranslation();

  const statusLabel =
    window.status === "OVERDUE"
      ? t("husbandryPlan.overdue")
      : window.status === "ACTIVE"
        ? t("husbandryPlan.active")
        : window.status === "UPCOMING"
          ? t("husbandryPlan.upcoming")
          : window.status;

  return (
    <div className="rounded-xl border border-border/80 bg-muted/25 px-3.5 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold tracking-tight">
            {translateDynamicText(window.title, language)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {translateDynamicText(window.description, language)}
          </p>
        </div>
        <Badge tone={toneForStatus(window.status)}>{statusLabel}</Badge>
      </div>
      {window.start && window.end ? (
        <p className="mt-2 text-sm">
          <span className="font-medium">{window.start}</span>
          <span className="text-muted-foreground"> → </span>
          <span className="font-medium">{window.end}</span>
          {window.ideal ? (
            <span className="text-muted-foreground">
              {" "}
              · {t("husbandryPlan.ideal")} {window.ideal}
            </span>
          ) : null}
        </p>
      ) : null}
      <p className="mt-1 text-xs text-muted-foreground">
        {translateDynamicText(window.message, language)}
      </p>
    </div>
  );
}

export function HusbandryPlanPanel({ plan }: { plan?: HusbandryPlan | null }) {
  const { language, t } = useTranslation();

  if (!plan) {
    return (
      <EmptyState
        title={t("husbandryPlan.noHusbandryPlan")}
        description={t("husbandryPlan.noHusbandryPlanHint")}
      />
    );
  }

  const cls = plan.animal_class;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.15rem] border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {t("husbandryPlan.autoDetectedClass")}
        </p>
        {(() => {
          const catText = translateDynamicText(cls.category_label || cls.category || "—", language);
          const labelText = translateDynamicText(cls.label, language);
          return (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="accent">{catText}</Badge>
              {labelText && labelText !== catText ? <Badge>{labelText}</Badge> : null}
            </div>
          );
        })()}
        <p className="mt-2 text-sm text-muted-foreground">
          {translateDynamicText(cls.basis, language)}
        </p>
        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <p>
            {t("husbandryPlan.age")}:{" "}
            <span className="font-medium text-foreground">
              {cls.age_days != null
                ? `${cls.age_days}d${cls.age_months != null ? ` (~${cls.age_months} mo)` : ""}`
                : t("husbandryPlan.unknown")}
            </span>
          </p>
          <p>
            {t("husbandryPlan.lastCalved")}:{" "}
            <span className="font-medium text-foreground">
              {cls.last_calving_date || t("husbandryPlan.never")}
            </span>
          </p>
          <p>
            {t("husbandryPlan.lastAi")}:{" "}
            <span className="font-medium text-foreground">
              {cls.last_insemination_date || t("husbandryPlan.none")}
            </span>
          </p>
        </div>
      </div>

      {plan.warnings.length > 0 ? (
        <Card>
          <CardHeader>
            <h3 className="font-display text-base font-bold">{t("husbandryPlan.needsAttention")}</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.warnings.map((w) => (
              <div key={w.code} className="rounded-xl border border-border px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {translateDynamicText(w.title, language)}
                  </p>
                  <Badge tone={toneForSeverity(w.severity)}>
                    {w.severity === "CRITICAL"
                      ? t("husbandryPlan.critical")
                      : w.severity === "WARNING"
                        ? t("husbandryPlan.warning")
                        : w.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {translateDynamicText(w.message, language)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <h3 className="font-display text-base font-bold">{t("husbandryPlan.suggestedDayRanges")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("husbandryPlan.suggestedDayRangesDesc")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.windows.length === 0 ? (
            <EmptyState
              title={t("husbandryPlan.noWindowsYet")}
              description={t("husbandryPlan.noWindowsHint")}
            />
          ) : (
            plan.windows.map((w) => <WindowRow key={`${w.key}-${w.start}`} window={w} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
