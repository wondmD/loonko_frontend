"use client";

import { Bell, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { toast } from "@/stores/toast-store";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { useAlerts } from "@/features/alerts/hooks/use-alerts";
import { useAuthStore } from "@/stores/auth-store";

import { useTranslation } from "@/lib/i18n";

export default function AlertsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const { t } = useTranslation();
  const alerts = useAlerts();
  const rows = alerts.list.data?.results ?? [];
  const isOwner = role === "OWNER";
  const queryClient = useQueryClient();

  const dryOffMutation = useMutation({
    mutationFn: async (cattleId: number) => {
      const res = await apiClient.post(`/cattle/${cattleId}/dry_off/`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Cattle successfully dried off");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["cattle"] });
    },
    onError: (err: any) => {
      toast.error("Action failed", err.response?.data?.detail || "Failed to dry off cattle");
    }
  });

  return (
    <div>
      <PageHeader
        title={t("alerts.title")}
        description={t("alerts.subtitle")}
        actions={
          isOwner ? (
            <Button
              variant="secondary"
              loading={alerts.generate.isPending}
              onClick={() => alerts.generate.mutate()}
            >
              <RefreshCw className="h-4 w-4" />
              {t("alerts.refreshAlerts")}
            </Button>
          ) : null
        }
      />

      {isOwner && alerts.generate.isSuccess ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Created {alerts.generate.data?.created ?? 0} new alert(s). Schedule daily jobs with{" "}
          <code className="rounded bg-muted px-1">scripts/run_daily_jobs.sh</code> for automatic
          refreshes.
        </p>
      ) : null}

      {alerts.list.isLoading ? <LoadingState /> : null}
      {alerts.list.isError ? (
        <ErrorState message="Failed to load alerts." onRetry={() => alerts.list.refetch()} />
      ) : null}
      {!alerts.list.isLoading && rows.length === 0 ? (
        <EmptyState icon={Bell} title={t("alerts.noAlerts")} description="No alerts in your inbox." />
      ) : null}

      <div className="space-y-3">
        {rows.map((alert) => (
          <div
            key={alert.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{alert.title}</p>
                  <Badge
                    tone={
                      alert.severity === "CRITICAL"
                        ? "danger"
                        : alert.severity === "WARNING"
                          ? "warning"
                          : "default"
                    }
                  >
                    {alert.severity}
                  </Badge>
                  {!alert.is_read ? <Badge tone="accent">New</Badge> : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{alert.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(alert.created_at).toLocaleString()}
                  {alert.cattle_tag ? ` · ${alert.cattle_tag}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {!alert.is_read ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => alerts.markRead.mutate(alert.id)}
                  >
                    {t("alerts.markAsRead")}
                  </Button>
                ) : null}
                {alert.title.toLowerCase().includes("dry-off") && alert.cattle ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => dryOffMutation.mutate(alert.cattle!)}
                    disabled={dryOffMutation.isPending}
                  >
                    {dryOffMutation.isPending && dryOffMutation.variables === alert.cattle ? "Processing..." : "Dry-off the cattle"}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => alerts.acknowledge.mutate(alert.id)}
                >
                  {t("alerts.acknowledge")}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
