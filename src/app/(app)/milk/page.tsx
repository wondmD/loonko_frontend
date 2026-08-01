"use client";

import { ChevronRight, Milk as MilkIcon, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleTabs } from "@/components/ui/module-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useMilk } from "@/features/milk/hooks/use-milk";
import { canAccess } from "@/lib/auth/access";
import { formatLiters } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";



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

import { useTranslation } from "@/lib/i18n";

export default function MilkPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const { t } = useTranslation();
  const canWrite = canAccess(role, "milkWrite");
  const milk = useMilk();
  const rows = milk.herd.data?.results ?? [];

  return (
    <div>
      <PageHeader
        title={t("milk.title")}
        description={t("milk.subtitle")}
        actions={
          canWrite ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/milk/new"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-transparent bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("milk.logMilk")}
              </Link>
            </div>
          ) : null
        }
      />

      <ModuleTabs
        items={[
          { href: "/milk", label: t("milk.title"), exact: true },
          { href: "/milk/feed", label: t("husbandry.feedType") },
        ]}
      />

      {milk.herd.isLoading ? <LoadingState /> : null}
      {milk.herd.isError ? (
        <ErrorState
          message="Failed to load milking herd."
          onRetry={() => milk.herd.refetch()}
        />
      ) : null}
      {!milk.herd.isLoading && !milk.herd.isError && rows.length === 0 ? (
        <EmptyState
          icon={MilkIcon}
          title={t("milk.noRecords")}
          description="Add calving history or milk records to see cows here."
        />
      ) : null}

      {rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-base">
              <thead className="border-b border-border bg-muted/40 text-sm uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">{t("cattle.tagId")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">{t("breeding.calvingHistory")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">
                    {t("milk.avgDaily")}
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">
                    {t("breeding.expectedCalving")}
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">
                    DIM
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.cattle_id}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/milk/${row.cattle_id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/milk/${row.cattle_id}`);
                      }
                    }}
                    className="cursor-pointer border-b border-border/70 transition-colors last:border-0 hover:bg-muted/35 focus-visible:bg-muted/35 focus-visible:outline-none"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{row.cattle_number}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        {row.name ? (
                          <span className="text-xs text-muted-foreground">{row.name}</span>
                        ) : null}
                        <Badge
                          tone={row.is_actively_milking ? "success" : "default"}
                          className="text-[10px]"
                        >
                          {row.lactation_stage_label || row.lactation_stage}
                        </Badge>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatShortDate(row.last_birth_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {formatLiters(row.average_milk_production)}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        / day
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatShortDate(row.next_estimated_dry_off)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.milked_days_current_calving != null
                        ? `${row.milked_days_current_calving} d`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      <ChevronRight className="ml-auto h-4 w-4" aria-hidden />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
