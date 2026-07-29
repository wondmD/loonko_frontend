"use client";

import { Beef, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { AddCattleModal } from "@/features/cattle/components/add-cattle-modal";
import { CattlePhoto } from "@/features/cattle/components/cattle-photo";
import { useCattle } from "@/features/cattle/hooks/use-cattle";
import { cattleApi } from "@/lib/api/services";
import { canAccess } from "@/lib/auth/access";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";

import { useTranslation } from "@/lib/i18n";

type CategoryTab = "ALL" | "CALF" | "HEIFER" | "COW";

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: "", label: "Any status" },
  { key: "pregnant", label: "Pregnant" },
  { key: "close_calving", label: "Near calving" },
  { key: "close_dry_off", label: "Near dry-off" },
  { key: "dry", label: "Dry" },
  { key: "fresh", label: "Fresh" },
  { key: "open", label: "Open" },
  { key: "needs_breeding", label: "Needs breeding" },
  { key: "calving_overdue", label: "Calving overdue" },
];

export default function CattlePage() {
  const role = useAuthStore((s) => s.user?.role);
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryTab>("ALL");
  const [herdFilter, setHerdFilter] = useState("");
  const [open, setOpen] = useState(false);

  const categoryTabs: Array<{ key: CategoryTab; label: string }> = [
    { key: "ALL", label: t("cattle.allStatuses") },
    { key: "CALF", label: t("cattle.calf") },
    { key: "HEIFER", label: t("cattle.heifer") },
    { key: "COW", label: t("cattle.lactating") },
  ];

  const listParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category && category !== "ALL") params.category = category;
    if (herdFilter) params.herd_filter = herdFilter;
    return params;
  }, [search, category, herdFilter]);

  const { list } = useCattle(listParams);
  const facets = useQuery({
    queryKey: ["cattle", "facets"],
    queryFn: () => cattleApi.facets(),
  });

  const canWrite = canAccess(role, "cattleWrite");
  const rows = useMemo(() => list.data?.results ?? [], [list.data]);
  const categoryCounts = facets.data?.categories;

  return (
    <div>
      <PageHeader
        title={t("cattle.title")}
        description={t("cattle.subtitle")}
        actions={
          canWrite ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("cattle.addCattle")}
            </Button>
          ) : null
        }
      />

      <AddCattleModal open={open} onClose={() => setOpen(false)} />

      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-muted/70 p-1">
          {categoryTabs.map((tab) => {
            const count = categoryCounts?.[tab.key];
            const active = category === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCategory(tab.key)}
                className={cn(
                  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition sm:flex-none",
                  active
                    ? "bg-card text-foreground shadow-[var(--shadow-sm)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {typeof count === "number" ? (
                  <span className="tabular-nums text-xs opacity-55">{count}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("cattle.searchPlaceholder")}
              className="h-10 w-full rounded-xl border border-border bg-card pr-3 pl-10 text-sm"
            />
          </label>
          <div className="sm:w-52">
            <Select
              name="herd_filter"
              value={herdFilter}
              onChange={(e) => setHerdFilter(e.target.value)}
              options={STATUS_FILTERS.map((f) => ({
                label: f.label,
                value: f.key,
              }))}
            />
          </div>
        </div>
      </div>

      {list.isLoading ? <LoadingState /> : null}
      {list.isError ? (
        <ErrorState message="Failed to load cattle." onRetry={() => list.refetch()} />
      ) : null}

      {!list.isLoading && !list.isError && rows.length === 0 ? (
        <EmptyState
          icon={Beef}
          title={t("cattle.noCattle")}
          description="Try another filter, or add an animal to the herd."
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((cow) => {
          const stage =
            cow.life_stage?.category_label ||
            cow.husbandry_plan?.animal_class?.category_label ||
            "—";
          const statusLabel =
            cow.lactation?.stage_label || cow.life_stage?.label || null;
          const warning = cow.husbandry_plan?.warnings?.[0]?.title;
          const next = cow.next_event;

          return (
            <Link
              key={cow.id}
              href={`/cattle/${cow.id}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/30 hover:shadow-[var(--shadow-md)]"
            >
              <div className="relative">
                <CattlePhoto
                  src={cow.photo_front_url || cow.photo_url}
                  alt={`${cow.tag_id} front`}
                  size="card"
                  tagHint={cow.tag_id}
                  className="rounded-none"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-3.5 pt-14 pb-3">
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-xl font-bold text-white">{cow.tag_id}</p>
                      <p className="truncate text-sm text-white/80">
                        {cow.name || "Unnamed"}
                        {cow.breed ? ` · ${cow.breed}` : ""}
                      </p>
                    </div>
                    {cow.sex === "MALE" ? (
                      <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
                        {t("cattle.male")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="space-y-2 p-3.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="accent">{stage}</Badge>
                  {statusLabel ? <Badge>{statusLabel}</Badge> : null}
                  {cow.lactation?.days_in_milk != null ? (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {cow.lactation.days_in_milk} DIM
                    </span>
                  ) : null}
                </div>
                {warning ? (
                  <p className="text-xs font-medium text-warning">{warning}</p>
                ) : next ? (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{next.title}</span>
                    {" · "}
                    {next.days_until === 0
                      ? "Today"
                      : next.days_until > 0
                        ? `in ${next.days_until}d`
                        : `${Math.abs(next.days_until)}d overdue`}
                    {next.date ? (
                      <span className="text-muted-foreground/80"> ({next.date})</span>
                    ) : null}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No upcoming event</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
