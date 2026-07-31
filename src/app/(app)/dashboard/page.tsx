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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
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

  const herdData = Object.entries(cattle.facets.data?.categories ?? {}).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value,
  })).filter((item) => item.value > 0);
  const HERD_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#6366f1", "#ec4899", "#8b5cf6"];

  const financeData = (finance?.byCategory.data?.breakdown ?? []).map((item) => ({
    name: item.category,
    income: item.type === "INCOME" ? Number(item.total) : 0,
    expense: item.type === "EXPENSE" ? Number(item.total) : 0,
  }));
  const aggregatedFinance = Object.values(
    financeData.reduce((acc, curr) => {
      if (!acc[curr.name]) acc[curr.name] = { name: curr.name, income: 0, expense: 0 };
      acc[curr.name].income += curr.income;
      acc[curr.name].expense += curr.expense;
      return acc;
    }, {} as Record<string, any>)
  ).filter((item: any) => item.income > 0 || item.expense > 0);

  const husbandryData = [
    { name: "Overdue", value: husbandry.data?.counts.overdue ?? 0, fill: "#ef4444" },
    { name: "Today", value: husbandry.data?.counts.due_today ?? 0, fill: "#f59e0b" },
    { name: "Upcoming", value: husbandry.data?.counts.upcoming ?? 0, fill: "#3b82f6" },
  ].filter((item) => item.value > 0);

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
        {/* Milk Trends */}
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

        {/* Husbandry Board Summary Chart */}
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-bold">Husbandry Tasks</h2>
            <p className="text-xs text-muted-foreground">Current Board Progress</p>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            {husbandryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={husbandryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {husbandryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.noTasksDue")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Herd Status Distribution */}
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-bold">Herd Status</h2>
            <p className="text-xs text-muted-foreground">Breakdown of actively tracked cattle</p>
          </CardHeader>
          <CardContent className="h-80">
            {herdData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={herdData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {herdData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={HERD_COLORS[index % HERD_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No cattle registered yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Finance Overview (Owner Only) */}
        {role === "OWNER" && (
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-bold">Financial Overview</h2>
              <p className="text-xs text-muted-foreground">Income vs Expenses (30 Days)</p>
            </CardHeader>
            <CardContent className="h-80">
              {aggregatedFinance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregatedFinance} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickMargin={10} stroke="var(--color-muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
                      contentStyle={{ borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No financial data in the last 30 days.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
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
