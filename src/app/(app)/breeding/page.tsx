"use client";

import { Form, Formik } from "formik";
import { Plus } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ModuleTabs } from "@/components/ui/module-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useBreeding } from "@/features/breeding/hooks/use-breeding";
import { useCattle } from "@/features/cattle/hooks/use-cattle";
import { useAuthStore } from "@/stores/auth-store";

const eventSchema = Yup.object({
  dam: Yup.string().required(),
  mating_date: Yup.string().required(),
  method: Yup.string().required(),
  notes: Yup.string(),
});

const BREEDING_TABS = [
  { href: "/breeding", label: "Mating", exact: true },
  { href: "/breeding/calving", label: "Calving" },
];

export default function BreedingPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canCreateEvent = role === "OWNER" || role === "WORKER";
  const canConfirm = role === "OWNER" || role === "VETERINARIAN";
  const [open, setOpen] = useState(false);
  const breeding = useBreeding();
  const cattle = useCattle({ status: "ACTIVE" });
  const events = breeding.events.data?.results ?? [];
  const pregnancies = breeding.pregnancies.data?.results ?? [];
  const options =
    cattle.list.data?.results
      .filter((c) => c.sex !== "MALE")
      .map((c) => ({
        label: `${c.tag_id}${c.name ? ` — ${c.name}` : ""}`,
        value: String(c.id),
      })) ?? [];

  return (
    <div>
      <PageHeader
        title="Breeding"
        description="Mating events and pregnancy tracking."
        actions={
          canCreateEvent ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Log mating
            </Button>
          ) : null
        }
      />

      <ModuleTabs items={BREEDING_TABS} />

      {breeding.events.isLoading || breeding.pregnancies.isLoading ? <LoadingState /> : null}
      {breeding.events.isError ? (
        <ErrorState
          message="Failed to load breeding data."
          onRetry={() => breeding.events.refetch()}
        />
      ) : null}

      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-semibold">Pregnancies</h2>
        {pregnancies.length === 0 ? (
          <EmptyState title="No pregnancies" description="Track confirmed pregnancies here." />
        ) : (
          <div className="space-y-3">
            {pregnancies.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{p.cattle_tag}</p>
                  <Badge
                    tone={
                      p.status === "PREGNANT"
                        ? "accent"
                        : p.status === "CALVED"
                          ? "success"
                          : "default"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Expected calving: {p.expected_calving_date || "—"}
                </p>
                {p.clinical_notes ? (
                  <p className="mt-2 text-sm text-muted-foreground">{p.clinical_notes}</p>
                ) : null}
                {canConfirm && p.status === "OPEN" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3"
                    loading={breeding.updatePregnancy.isPending}
                    onClick={() =>
                      breeding.updatePregnancy.mutate({
                        id: p.id,
                        payload: { status: "PREGNANT" },
                      })
                    }
                  >
                    Confirm pregnant
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Mating events</h2>
        {events.length === 0 ? (
          <EmptyState title="No mating events" />
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <div key={e.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="font-medium">
                  {e.dam_tag} · {e.method}
                </p>
                <p className="text-xs text-muted-foreground">{e.mating_date}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Log mating">
        <Formik
          initialValues={{
            dam: options[0]?.value || "",
            mating_date: new Date().toISOString().slice(0, 10),
            method: "AI",
            notes: "",
          }}
          enableReinitialize
          validationSchema={eventSchema}
          onSubmit={async (values, helpers) => {
            try {
              await breeding.createEvent.mutateAsync({
                dam: Number(values.dam),
                mating_date: values.mating_date,
                method: values.method as "NATURAL" | "AI",
                notes: values.notes,
              });
              setOpen(false);
            } catch (error) {
              helpers.setStatus(getMutationError(error).message);
            }
          }}
        >
          {({ values, handleChange, handleBlur, status }) => (
            <Form className="space-y-4">
              <Select
                label="Dam"
                name="dam"
                value={values.dam}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[{ label: "Select…", value: "" }, ...options]}
              />
              <Input
                label="Mating date"
                name="mating_date"
                type="date"
                value={values.mating_date}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Select
                label="Method"
                name="method"
                value={values.method}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[
                  { label: "Artificial Insemination", value: "AI" },
                  { label: "Natural", value: "NATURAL" },
                ]}
              />
              <Textarea
                label="Notes"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={breeding.createEvent.isPending}>
                Save
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
