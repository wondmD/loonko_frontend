"use client";

import { Form, Formik } from "formik";
import { Plus } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";

import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ModuleTabs } from "@/components/ui/module-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useCattle } from "@/features/cattle/hooks/use-cattle";
import { useFeed } from "@/features/milk/hooks/use-feed";
import { canAccess } from "@/lib/auth/access";
import { useTranslation } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth-store";

const schema = Yup.object({
  cattle: Yup.string(),
  feed_type: Yup.string().required("Feed type is required"),
  quantity: Yup.number().min(0).required(),
  unit: Yup.string().required(),
  date: Yup.string().required(),
  cost: Yup.number().min(0).nullable(),
  notes: Yup.string(),
});

function FeedContent() {
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = canAccess(role, "milkWrite");
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const feed = useFeed();
  const cattle = useCattle({ status: "ACTIVE" });
  const rows = feed.list.data?.results ?? [];
  const options =
    cattle.list.data?.results.map((c) => ({
      label: `${c.tag_id}${c.name ? ` — ${c.name}` : ""}`,
      value: String(c.id),
    })) ?? [];

  return (
    <div>
      <PageHeader
        title={t("feedPage.title")}
        description={t("feedPage.description")}
        actions={
          canWrite ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("feedPage.logFeed")}
            </Button>
          ) : null
        }
      />

      <ModuleTabs
        items={[
          { href: "/milk", label: t("milk.milkLogs"), exact: true },
          { href: "/milk/feed", label: t("feedPage.title") },
        ]}
      />

      {feed.list.isLoading ? <LoadingState /> : null}
      {feed.list.isError ? (
        <ErrorState message="Failed to load feed logs." onRetry={() => feed.list.refetch()} />
      ) : null}
      {!feed.list.isLoading && rows.length === 0 ? (
        <EmptyState title={t("feedPage.noFeedLogs")} description={t("feedPage.noFeedLogsHint")} />
      ) : null}

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
          >
            <div>
              <p className="font-medium">
                {row.feed_type}
                {row.cattle_tag ? ` · ${row.cattle_tag}` : ` · ${t("feedPage.wholeHerd")}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {row.date} · {row.quantity} {row.unit}
                {row.cost != null && Number(row.cost) > 0
                  ? ` · ${formatMoney(row.cost)}`
                  : ""}
              </p>
            </div>
            {canWrite ? (
              <Button size="sm" variant="ghost" onClick={() => feed.remove.mutate(row.id)}>
                {t("common.delete")}
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t("feedPage.logFeed")}>
        <Formik
          initialValues={{
            cattle: "",
            feed_type: "",
            quantity: 0,
            unit: "kg",
            date: new Date().toISOString().slice(0, 10),
            cost: "" as string | number,
            notes: "",
          }}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              await feed.create.mutateAsync({
                cattle: values.cattle ? Number(values.cattle) : null,
                feed_type: values.feed_type,
                quantity: String(values.quantity),
                unit: values.unit,
                date: values.date,
                cost:
                  values.cost === "" || values.cost == null
                    ? null
                    : String(values.cost),
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
                label={t("feedPage.cattleOptional")}
                name="cattle"
                value={values.cattle}
                onChange={handleChange}
                onBlur={handleBlur}
                options={[{ label: t("feedPage.wholeHerd"), value: "" }, ...options]}
              />
              <Input
                label={t("feedPage.feedType")}
                name="feed_type"
                value={values.feed_type}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Concentrate, hay, silage…"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t("feedPage.quantity")}
                  name="quantity"
                  type="number"
                  step="0.1"
                  value={values.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label={t("feedPage.unit")}
                  name="unit"
                  value={values.unit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <Input
                label={t("common.date")}
                name="date"
                type="date"
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Input
                label={t("feedPage.costOptional")}
                name="cost"
                type="number"
                step="0.01"
                value={values.cost}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Textarea
                label={t("cattle.notes")}
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <Button type="submit" className="w-full" loading={feed.create.isPending}>
                {t("common.save")}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}

export default function FeedPage() {
  return (
    <RequireAuth module="milk">
      <FeedContent />
    </RequireAuth>
  );
}
