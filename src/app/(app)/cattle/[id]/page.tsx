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
import { buildCattleFormData, useCattle, useCattleDetail } from "@/features/cattle/hooks/use-cattle";
import { HusbandryTaskRow } from "@/features/husbandry/components/husbandry-task-row";
import { canAccess } from "@/lib/auth/access";
import { formatLiters } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";

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
  const [editOpen, setEditOpen] = useState(false);
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
      : data.age_days < 365
        ? `${data.age_days} days`
        : `${(data.age_days / 365).toFixed(1)} years`;

  const animalClass = data.husbandry_plan?.animal_class || data.life_stage;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Animal profile"
        title={data.tag_id}
        description={data.name || "Cattle profile"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={data.status === "ACTIVE" ? "success" : "default"}>{data.status}</Badge>
            {data.sex === "MALE" ? <Badge>Male</Badge> : null}
            <Badge tone="accent">
              {animalClass?.category_label || animalClass?.category || "—"}
            </Badge>
            <Badge tone={data.lactation.is_pregnant ? "accent" : "default"}>
              {animalClass?.label || data.lactation.stage_label}
            </Badge>
            {canEditProfile ? (
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            ) : null}
          </div>
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

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["Front", data.photo_front_url],
            ["Left side", data.photo_left_url],
            ["Right side", data.photo_right_url],
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
            <h2 className="font-display text-lg font-semibold">Update identification photos</h2>
            <p className="text-sm text-muted-foreground">
              Replace any view. Upload only the sides you want to change.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {(
                [
                  ["photo_front", "Front"],
                  ["photo_left", "Left side"],
                  ["photo_right", "Right side"],
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
                  setStatusMsg("Photos updated");
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
              Save photos
            </Button>
            {statusMsg ? <p className="text-sm text-muted-foreground">{statusMsg}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Age" value={ageLabel} />
        <StatCard
          label="Class"
          value={animalClass?.category_label || "—"}
          hint={animalClass?.label}
        />
        <StatCard
          label="Lactation"
          value={data.lactation.stage}
          hint={
            data.lactation.days_in_milk != null
              ? `${data.lactation.days_in_milk} days in milk`
              : data.lactation.stage_label
          }
          icon={Droplets}
        />
        <StatCard
          label="30-day milk"
          value={formatLiters(data.milk_summary.last_30_days_liters)}
          hint={`Avg ${Number(data.milk_summary.average_daily_30).toFixed(1)} L / record`}
          icon={Droplets}
        />
      </div>

      {data.sex === "FEMALE" ? <HusbandryPlanPanel plan={data.husbandry_plan} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Husbandry schedule</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Auto-generated dairy lifecycle tasks for this female.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.sex !== "FEMALE" ? (
              <EmptyState
                title="Male animal"
                description="Husbandry automation focuses on female dairy cattle."
              />
            ) : (data.husbandry_tasks ?? []).length === 0 ? (
              <EmptyState title="No pending husbandry tasks" />
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
              <h2 className="font-display text-lg font-semibold">Upcoming events</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcoming_events.length === 0 ? (
              <EmptyState title="No upcoming events" />
            ) : (
              data.upcoming_events.map((event) => (
                <div
                  key={`${event.type}-${event.date}-${event.title}`}
                  className="rounded-2xl border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
                    </div>
                    <Badge tone={event.days_until <= 7 ? "warning" : "default"}>
                      {event.date}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {event.days_until === 0
                      ? "Today"
                      : event.days_until > 0
                        ? `In ${event.days_until} days`
                        : `${Math.abs(event.days_until)} days overdue`}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">Profile details</h2>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Name" value={data.name || "—"} />
          <Info label="Breed" value={data.breed || "—"} />
          {data.sex === "MALE" ? <Info label="Gender" value="Male" /> : null}
          <Info label="Life stage" value={data.life_stage?.label || "—"} />
          <Info label="Date of birth" value={data.date_of_birth || "—"} />
          <Info label="Last calving" value={data.lactation.last_calving_date || "—"} />
          <Info
            label="Pregnancy"
            value={data.lactation.is_pregnant ? "Pregnant" : "Open / not pregnant"}
          />
          <div className="sm:col-span-2">
            <Info label="Notes" value={data.notes || "—"} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Milk production summary</h2>
          </div>
        </CardHeader>
        <CardContent>
          {(data.recent_milk ?? []).length === 0 ? (
            <EmptyState title="No milk records" description="Log yields from the Milk module." />
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
            <h2 className="font-display text-lg font-semibold">Breeding history</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Section title="Pregnancies">
            {data.breeding_history.pregnancies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pregnancies recorded.</p>
            ) : (
              data.breeding_history.pregnancies.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {p.status}
                    {p.expected_calving_date ? ` · due ${p.expected_calving_date}` : ""}
                  </span>
                  <Badge>{p.status}</Badge>
                </div>
              ))
            )}
          </Section>
          <Section title="Mating / AI events">
            {data.breeding_history.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No breeding events.</p>
            ) : (
              data.breeding_history.events.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-border px-3 py-2 text-sm"
                >
                  {e.mating_date} · {e.method}
                </div>
              ))
            )}
          </Section>
          <Section title="Births">
            {data.breeding_history.births.length === 0 ? (
              <p className="text-sm text-muted-foreground">No birth records.</p>
            ) : (
              data.breeding_history.births.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-border px-3 py-2 text-sm"
                >
                  Calved {b.calving_date}
                  {b.calf_tag_id ? ` · calf ${b.calf_tag_id}` : ""}
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
            <h2 className="font-display text-lg font-semibold">Alerts for this cattle</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.alerts.length === 0 ? (
            <EmptyState title="No alerts" description="Nothing flagged for this animal." />
          ) : (
            data.alerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-border px-4 py-3">
                <div className="flex items-center justify-between gap-2">
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
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
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
