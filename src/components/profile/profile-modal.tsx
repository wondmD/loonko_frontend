"use client";

import { Form, Formik } from "formik";
import { UserRound } from "lucide-react";
import * as Yup from "yup";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { LanguageSelector } from "@/components/ui/language-selector";
import { getMutationError, useAuth } from "@/features/auth/hooks/use-auth";
import { displayName } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth-store";
import { useState } from "react";

const schema = Yup.object({
  first_name: Yup.string(),
  last_name: Yup.string(),
  phone: Yup.string(),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  username: Yup.string().required("Username is required"),
});

export function ProfileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();
  const { updateProfile, updateProfilePending } = useAuth();
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={() => {
        setEditing(false);
        onClose();
      }}
      title={t("profile.title")}
      className="sm:max-w-md"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UserRound className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold tracking-tight">
            {displayName(user)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone="accent">{t(`roles.${user.role}`)}</Badge>
            {user.farm_name ? <Badge>{user.farm_name}</Badge> : null}
          </div>
        </div>
      </div>

      {!editing ? (
        <div className="space-y-3">
          <Row label={t("auth.email")} value={user.email} />
          <Row label="Username" value={user.username} />
          <Row label={t("auth.phone")} value={user.phone || "—"} />
          <Row
            label="Member since"
            value={
              user.date_joined
                ? new Date(user.date_joined).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"
            }
          />
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
              {t("profile.language")}
            </p>
            <LanguageSelector variant="full" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={() => setEditing(true)}>
              {t("common.edit")}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              {t("common.close")}
            </Button>
          </div>
        </div>
      ) : (
        <Formik
          initialValues={{
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            phone: user.phone || "",
            email: user.email || "",
            username: user.username || "",
          }}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            try {
              await updateProfile(values);
              setEditing(false);
            } catch (error) {
              helpers.setStatus(getMutationError(error).message);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, status }) => (
            <Form className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="First name"
                  name="first_name"
                  value={values.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Input
                  label="Last name"
                  name="last_name"
                  value={values.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <Input
                label={t("auth.email")}
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : undefined}
              />
              <Input
                label="Username"
                name="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.username ? errors.username : undefined}
              />
              <Input
                label={t("auth.phone")}
                name="phone"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {status ? <p className="text-sm text-danger">{status}</p> : null}
              <div className="flex gap-2 pt-1">
                <Button type="submit" className="flex-1" loading={updateProfilePending}>
                  {t("common.save")}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3.5 py-2.5">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium break-all">{value}</p>
    </div>
  );
}
