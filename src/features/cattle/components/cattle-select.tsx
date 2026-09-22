"use client";

import { type ChangeEvent, type FocusEvent, useMemo, useState } from "react";

import { Select } from "@/components/ui/select";
import { cattleChoiceLabel } from "@/features/cattle/hooks/use-cattle";
import { useTranslation } from "@/lib/i18n";
import type { CattleChoice } from "@/types";

export function CattleSelect({
  animals,
  isLoading,
  filter,
  emptyOption,
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: {
  animals: CattleChoice[];
  isLoading?: boolean;
  filter?: (cattle: CattleChoice) => boolean;
  emptyOption?: { label: string; value: string };
  label?: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: FocusEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const base = filter ? animals.filter(filter) : animals;
    const needle = query.trim().toLowerCase();
    const matched = needle
      ? base.filter((cattle) => {
          const haystack = `${cattle.tag_id} ${cattle.name ?? ""}`.toLowerCase();
          return haystack.includes(needle);
        })
      : base;

    const mapped = matched.map((cattle) => ({
      label: cattleChoiceLabel(cattle),
      value: String(cattle.id),
    }));

    if (value && !mapped.some((opt) => opt.value === value)) {
      const selected = animals.find((cattle) => String(cattle.id) === value);
      if (selected) {
        mapped.unshift({
          label: cattleChoiceLabel(selected),
          value: String(selected.id),
        });
      }
    }

    const head = emptyOption
      ? [emptyOption]
      : [{ label: `${t("common.select")}…`, value: "" }];
    return [...head, ...mapped];
  }, [animals, emptyOption, filter, query, t, value]);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("cattle.searchPlaceholder")}
        className="h-10 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_18%,transparent)]"
        aria-label={t("cattle.searchPlaceholder")}
      />
      <Select
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        options={options}
        error={error}
        disabled={disabled || isLoading}
      />
    </div>
  );
}
