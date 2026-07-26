"use client";

import {
  Bell,
  CalendarClock,
  HeartPulse,
  Milk as MilkIcon,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { canAccess } from "@/lib/auth/access";
import { formatLiters, formatMoney } from "@/lib/utils/cn";

export default function DashboardPage() {
  const { role, milk, cattle, health, breeding, alerts, finance, husbandry } = useDashboard();

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
    <div>
      <PageHeader
        title="Home"
        description={
          role === "VETERINARIAN"
            ? "Health overview for the herd."
            : "Milk, herd status, and care at a glance."
        }
        actions={
          canAccess(role, "milkWrite") ? (
            <Link
              href="/milk/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold tracking-tight text-primary-foreground shadow-[var(--shadow-sm)]"
            >
              Log today’s milk
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Milk today"
          value={formatLiters(milk.summary.data?.total_liters)}
          hint={`${milk.summary.data?.record_count ?? 0} records`}
          icon={MilkIcon}
        />
        <StatCard
          label="Active herd"
          value={cattle.list.data?.count ?? cattle.list.data?.results.length ?? 0}
          hint="Cattle marked active"
          icon={HeartPulse}
        />
        <StatCard
          label="Overdue tasks"
          value={husbandry.data?.counts.overdue ?? 0}
          hint="Husbandry board"
          icon={CalendarClock}
        />
        <StatCard
          label="Open alerts"
          value={alerts.unread.data?.unread ?? 0}
          hint="Needs attention"
          icon={Bell}
        />
        {role === "OWNER" && finance ? (
          <StatCard
            label="30-day profit"
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
            label="Vaccinations due"
            value={health.upcoming.data?.length ?? 0}
            hint="Next 7 days"
            icon={TriangleAlert}
          />
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">Milk trend</h2>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="milkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="liters"
                  stroke="var(--color-primary)"
                  fill="url(#milkFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">Care queue</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {(husbandry.data?.overdue ?? []).slice(0, 3).map((task) => (
              <div
                key={`h-${task.id}`}
                className="rounded-xl border border-border bg-muted/40 px-3 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{task.cattle_tag}</p>
                  <Badge tone="danger">Overdue</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{task.title}</p>
              </div>
            ))}
            {(health.upcoming.data ?? []).slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-muted/40 px-3 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.cattle_tag}</p>
                  <Badge tone="warning">{item.next_due_on}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.vaccine_name}</p>
              </div>
            ))}
            {(husbandry.data?.overdue ?? []).length === 0 &&
            (health.upcoming.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue tasks or vaccinations due soon.</p>
            ) : null}
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span>Pregnancies tracked: {breeding.pregnancies.data?.count ?? 0}</span>
              <Link href="/husbandry" className="font-medium text-foreground underline-offset-2 hover:underline">
                View tasks
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
