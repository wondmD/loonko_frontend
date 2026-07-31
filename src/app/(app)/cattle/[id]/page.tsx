"use client";

import type { ReactNode } from "react";
import { CalendarClock, Droplets, HeartPulse, History, Pencil } from "lucide-react";
import { use, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import {
  CattlePhoto,
  PhotoUploadField,
} from "@/features/cattle/components/cattle-photo";
import { EditCattleModal } from "@/features/cattle/components/edit-cattle-modal";
import { HusbandryPlanPanel } from "@/features/cattle/components/husbandry-plan-panel";
import { PedigreeTree } from "@/features/cattle/components/pedigree-tree";
import { GrowthTracker } from "@/features/cattle/components/growth-tracker";
import { StatusChangeModal } from "@/features/cattle/components/status-change-modal";
import { buildCattleFormData, useCattle, useCattleDetail } from "@/features/cattle/hooks/use-cattle";
import { HusbandryTaskRow } from "@/features/husbandry/components/husbandry-task-row";
import { canAccess } from "@/lib/auth/access";
import { formatLiters } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";

import { useTranslation } from "@/lib/i18n";
import { formatRelativeDays, translateDynamicText } from "@/lib/i18n/translate-dynamic";

export default function CattleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const cattleId = Number(id);
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = canAccess(role, "cattleWrite");
  const canEditProfile = role === "OWNER";
  const { data, isLoading, isError, refetch } = useCattleDetail(cattleId);
  const { update } = useCattle();
  const { language, t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [photoDrafts, setPhotoDrafts] = useState<{
    photo_front: File | null;
    photo_left: File | null;
    photo_right: File | null;
  }>({ photo_front: null, photo_left: null, photo_right: null });
  const [previews, setPreviews] = useState<Record<string, string | null>>({
    photo_front: null,
    photo_left: null,
    photo_right: null,
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data) {
    return <ErrorState message="Could not load cattle." onRetry={() => refetch()} />;
  }

  const ageLabel =
    data.age_days == null
      ? "—"
      : data.age_days < 60
        ? `${data.age_days}d`
        : `${(data.age_days / 30.4).toFixed(0)} mo`;

  const animalClass = data.husbandry_plan?.animal_class || data.life_stage;

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.tag_id}
        description={data.name || t("cattleDetail.eyebrow")}
        actions={
          canEditProfile ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStatusOpen(true)}
              >
                {t('cattle.status_change.button')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </Button>
            </div>
          ) : null
        }
      />

      {canEditProfile ? (
        <EditCattleModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          cattle={data}
          onSaved={() => refetch()}
        />
      ) : null}

      {statusOpen && canEditProfile && data ? (
        <StatusChangeModal
          open={statusOpen}
          onOpenChange={setStatusOpen}
          cattleId={cattleId}
          currentStatus={data.status}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            [t("cattleDetail.frontPhoto"), data.photo_front_url],
            [t("cattleDetail.leftPhoto"), data.photo_left_url],
            [t("cattleDetail.rightPhoto"), data.photo_right_url],
          ] as const
        ).map(([label, src]) => (
          <Card key={label} className="overflow-hidden">
            <CattlePhoto
              src={src}
              alt={`${data.tag_id} ${label}`}
              size="card"
              className="rounded-none"
            />
            <CardContent className="py-3">
              <p className="text-center text-sm font-medium">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {canWrite ? (
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">{t("cattleDetail.updatePhotosTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("cattleDetail.updatePhotosDesc")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {(
                [
                  ["photo_front", t("cattleDetail.frontPhoto")],
                  ["photo_left", t("cattleDetail.leftPhoto")],
                  ["photo_right", t("cattleDetail.rightPhoto")],
                ] as const
              ).map(([key, label]) => (
                <PhotoUploadField
                  key={key}
                  label={label}
                  preview={
                    previews[key] ||
                    (key === "photo_front"
                      ? data.photo_front_url
                      : key === "photo_left"
                        ? data.photo_left_url
                        : data.photo_right_url)
                  }
                  onChange={(file) => {
                    setPhotoDrafts((prev) => ({ ...prev, [key]: file }));
                    setPreviews((prev) => ({
                      ...prev,
                      [key]: file ? URL.createObjectURL(file) : prev[key],
                    }));
                  }}
                />
              ))}
            </div>
            <Button
              loading={update.isPending}
              onClick={async () => {
                if (
                  !photoDrafts.photo_front &&
                  !photoDrafts.photo_left &&
                  !photoDrafts.photo_right
                ) {
                  setStatusMsg("Choose at least one new photo to upload.");
                  return;
                }
                try {
                  setStatusMsg(null);
                  const form = buildCattleFormData({}, photoDrafts);
                  await update.mutateAsync({ id: cattleId, payload: form });
                  setStatusMsg(t("cattleDetail.photosUpdated"));
                  setPhotoDrafts({
                    photo_front: null,
                    photo_left: null,
                    photo_right: null,
                  });
                  await refetch();
                } catch (error) {
                  setStatusMsg(getMutationError(error).message);
                }
              }}
            >
              {t("cattleDetail.savePhotos")}
            </Button>
            {statusMsg ? <p className="text-sm text-muted-foreground">{statusMsg}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("cattleDetail.age")} value={ageLabel} />
        <StatCard
          label={t("cattleDetail.class")}
          value={translateDynamicText(animalClass?.category_label || animalClass?.category || "—", language)}
          hint={translateDynamicText(animalClass?.label, language)}
        />
        <StatCard
          label={t("cattleDetail.lactation")}
          value={translateDynamicText(data.lactation.stage, language)}
          hint={
            data.lactation.days_in_milk != null
              ? `${data.lactation.days_in_milk} ${t("milkDetail.dimAbbr")}`
              : translateDynamicText(data.lactation.stage_label, language)
          }
          icon={Droplets}
        />
        <StatCard
          label={t("cattleDetail.milk30Days")}
          value={formatLiters(data.milk_summary.last_30_days_liters)}
          hint={`Avg ${Number(data.milk_summary.average_daily_30).toFixed(1)} ${t("milk.litersAbbr")}`}
          icon={Droplets}
        />
      </div>

      {data.sex === "FEMALE" ? <HusbandryPlanPanel plan={data.husbandry_plan} /> : null}

      <div className="grid gap-6">
        <GrowthTracker 
          cattleId={cattleId} 
          latestBcs={data.latest_bcs} 
          latestWeight={data.latest_weight} 
          logs={data.growth_logs} 
        />
        <PedigreeTree data={data.pedigree_tree} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">{t("cattleDetail.husbandrySchedule")}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("cattleDetail.husbandryScheduleDesc")}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.sex !== "FEMALE" ? (
              <EmptyState
                title={t("cattleDetail.maleAnimal")}
                description={t("cattleDetail.maleAnimalDesc")}
              />
            ) : (data.husbandry_tasks ?? []).length === 0 ? (
              <EmptyState title={t("cattleDetail.noTasks")} />
            ) : (
              data.husbandry_tasks.map((task) => (
                <HusbandryTaskRow key={task.id} task={task} showCattle={false} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">{t("cattleDetail.upcomingEvents")}</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcoming_events.length === 0 ? (
              <EmptyState title={t("cattleDetail.noEvents")} />
            ) : (
              data.upcoming_events.map((event) => (
                <div
                  key={`${event.type}-${event.date}-${event.title}`}
                  className="rounded-2xl border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{translateDynamicText(event.title, language)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {translateDynamicText(event.description, language)}
                      </p>
                    </div>
                    <Badge tone={event.days_until <= 7 ? "warning" : "default"}>
                      {event.date}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatRelativeDays(event.days_until, language)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">{t("cattleDetail.profileDetails")}</h2>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label={t("common.name")} value={data.name || "—"} />
          <Info label={t("cattle.breed")} value={data.breed || "—"} />
          {data.sex === "MALE" ? <Info label={t("cattleDetail.gender")} value={t("cattle.male")} /> : null}
          <Info label={t("cattleDetail.lifeStage")} value={data.life_stage?.label || "—"} />
          <Info label={t("cattle.dob")} value={data.date_of_birth || "—"} />
          <Info label={t("cattleDetail.lastCalving")} value={data.lactation.last_calving_date || "—"} />
          <Info
            label={t("breeding.pregnancyStatus")}
            value={data.lactation.is_pregnant ? t("breeding.confirmed") : t("breeding.unconfirmed")}
          />
          <div className="sm:col-span-2">
            <Info label={t("cattle.notes")} value={data.notes || "—"} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">{t("cattleDetail.milkSummary")}</h2>
          </div>
        </CardHeader>
        <CardContent>
          {(data.recent_milk ?? []).length === 0 ? (
            <EmptyState title={t("cattleDetail.noMilkRecords")} description={t("cattleDetail.logYieldsHint")} />
          ) : (
            <div className="space-y-2">
              {data.recent_milk.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span>{row.date}</span>
                  <span className="font-medium">{formatLiters(row.total_liters)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">{t("cattleDetail.breedingHistory")}</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Section title={t("cattleDetail.pregnancies")}>
            {data.breeding_history.pregnancies.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("cattleDetail.noPregnancies")}</p>
            ) : (
              data.breeding_history.pregnancies.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {translateDynamicText(p.status, language)}
                    {p.expected_calving_date ? ` · ${t("cattleDetail.due")} ${p.expected_calving_date}` : ""}
                  </span>
                  <Badge>{translateDynamicText(p.status, language)}</Badge>
                </div>
              ))
            )}
          </Section>
          <Section title={t("cattleDetail.matingEvents")}>
            {data.breeding_history.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("cattleDetail.noMatingEvents")}</p>
            ) : (
              data.breeding_history.events.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-border px-3 py-2 text-sm"
                >
                  {e.mating_date} · {translateDynamicText(e.method, language)}
                </div>
              ))
            )}
          </Section>
          <Section title={t("cattleDetail.births")}>
            {data.breeding_history.births.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("cattleDetail.noBirths")}</p>
            ) : (
              data.breeding_history.births.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-border px-3 py-2 text-sm"
                >
                  {t("cattleDetail.calved")} {b.calving_date}
                  {b.calf_tag_id ? ` · ${t("cattleDetail.calf")} ${b.calf_tag_id}` : ""}
                </div>
              ))
            )}
          </Section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">{t("cattleDetail.cattleAlerts")}</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.alerts.length === 0 ? (
            <EmptyState title={t("cattleDetail.noAlerts")} description={t("cattleDetail.noAlertsHint")} />
          ) : (
            data.alerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-border px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{translateDynamicText(alert.title, language)}</p>
                  <Badge
                    tone={
                      alert.severity === "CRITICAL"
                        ? "danger"
                        : alert.severity === "WARNING"
                          ? "warning"
                          : "default"
                    }
                  >
                    {translateDynamicText(alert.severity, language)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {translateDynamicText(alert.message, language)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
