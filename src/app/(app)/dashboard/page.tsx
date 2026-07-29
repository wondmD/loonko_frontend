"use client";

import {
  Bell,
  CalendarClock,
  HeartPulse,
  Milk as MilkIcon,
  Plus,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { canAccess } from "@/lib/auth/access";
import { formatLiters, formatMoney } from "@/lib/utils/cn";

import { useTranslation } from "@/lib/i18n";

export default function DashboardPage() {
  const { role, milk, cattle, health, breeding, alerts, finance, husbandry } = useDashboard();
  const { t } = useTranslation();

  const loading =
    milk.summary.isLoading ||
    cattle.list.isLoading ||
    alerts.unread.isLoading ||
    health.upcoming.isLoading;

  if (loading) return <LoadingState />;

  if (milk.summary.isError) {
    return (
      <ErrorState
        message="Could not load dashboard metrics."
        onRetry={() => milk.summary.refetch()}
      />
    );
  }

  const chartData =
    milk.trends.data?.points.map((p) => ({
      date: String(p.date).slice(5, 10),
      liters: Number(p.liters),
    })) ?? [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={t("nav.dashboard")}
        description={
          role === "VETERINARIAN"
            ? t("dashboard.vetSubtitle")
            : t("dashboard.mainSubtitle")
        }
        actions={
          canAccess(role, "milkWrite") ? (
            <Link href="/milk/new">
              <Button size="md" className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
                <span>{t("dashboard.logTodayMilk")}</span>
              </Button>
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label={t("dashboard.milkToday")}
          value={formatLiters(milk.summary.data?.total_liters)}
          hint={`${milk.summary.data?.record_count ?? 0} records`}
          icon={MilkIcon}
        />
        <StatCard
          label={t("dashboard.activeCattle")}
          value={cattle.list.data?.count ?? cattle.list.data?.results.length ?? 0}
          hint="Cattle marked active"
          icon={HeartPulse}
        />
        <StatCard
          label={t("dashboard.overdueTasks")}
          value={husbandry.data?.counts.overdue ?? 0}
          hint="Husbandry board"
          icon={CalendarClock}
        />
        <StatCard
          label={t("dashboard.openAlerts")}
          value={alerts.unread.data?.unread ?? 0}
          hint="Needs attention"
          icon={Bell}
        />
        {role === "OWNER" && finance ? (
          <StatCard
            label={t("dashboard.profit30Days")}
            value={formatMoney(
              finance.summary.data?.profit,
              finance.summary.data?.currency,
            )}
            hint={
              finance.summary.data?.milk
                ? `Today’s milk value ${formatMoney(
                    finance.summary.data.milk.today_milk_value,
                    finance.summary.data.milk.currency,
                  )}`
                : "Includes auto milk income"
            }
            icon={Wallet}
          />
        ) : (
          <StatCard
            label={t("dashboard.vaccinationsDue")}
            value={health.upcoming.data?.length ?? 0}
            hint="Next 7 days"
            icon={TriangleAlert}
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-display text-lg font-bold">{t("dashboard.milkTrend")}</h2>
            <p className="text-xs text-muted-foreground">{t("dashboard.last30Days")}</p>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="milkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "0.75rem",
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="liters"
                  stroke="var(--color-primary)"
                  fill="url(#milkFill)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-bold">{t("dashboard.careQueue")}</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {(husbandry.data?.overdue ?? []).slice(0, 3).map((task) => (
              <div
                key={`h-${task.id}`}
                className="rounded-xl border border-border/70 bg-muted/30 px-3.5 py-3 transition-colors hover:border-border"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{task.cattle_tag}</p>
                  <Badge tone="danger">{t("dashboard.overdueTasks")}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{task.title}</p>
              </div>
            ))}
            {(health.upcoming.data ?? []).slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/70 bg-muted/30 px-3.5 py-3 transition-colors hover:border-border"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.cattle_tag}</p>
                  <Badge tone="warning">{item.next_due_on}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.vaccine_name}</p>
              </div>
            ))}
            {(husbandry.data?.overdue ?? []).length === 0 &&
            (health.upcoming.data ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{t("dashboard.noTasksDue")}</p>
            ) : null}
            <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground border-t border-border/40">
              <span>{t("dashboard.pregnanciesTracked")}: {breeding.pregnancies.data?.count ?? 0}</span>
              <Link href="/husbandry" className="font-semibold text-primary underline-offset-2 hover:underline">
                {t("common.view")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
