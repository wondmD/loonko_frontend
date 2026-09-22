"use client";

import { type ChangeEvent, type FocusEvent, useMemo, useRef, useState } from "react";

import { cattleChoiceLabel } from "@/features/cattle/hooks/use-cattle";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";
import type { CattleChoice } from "@/types";

function emitChange(
  name: string,
  value: string,
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void,
) {
  onChange({
    target: { name, value },
  } as ChangeEvent<HTMLSelectElement>);
}

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
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const base = useMemo(
    () => (filter ? animals.filter(filter) : animals),
    [animals, filter],
  );

  const selected = animals.find((cattle) => String(cattle.id) === value);
  const emptyLabel = emptyOption?.label ?? `${t("common.select")}…`;
  const selectedLabel = selected
    ? cattleChoiceLabel(selected)
    : value === (emptyOption?.value ?? "") && emptyOption
      ? emptyOption.label
      : "";

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return base;
    return base.filter((cattle) => {
      const haystack = `${cattle.tag_id} ${cattle.name ?? ""}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [base, query]);

  const pick = (next: string) => {
    emitChange(name, next, onChange);
    setQuery("");
    setOpen(false);
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => {
      setOpen(false);
      setQuery("");
      onBlur?.({
        target: { name, value },
      } as FocusEvent<HTMLSelectElement>);
    }, 120);
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5 text-base">
      {label ? <span className="font-medium text-foreground">{label}</span> : null}
      <div className="relative min-w-0">
        <input
          type="text"
          inputMode="search"
          name={`${name}-search`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled || isLoading}
          value={open ? query : selectedLabel}
          placeholder={isLoading ? t("common.loading") : emptyLabel}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setOpen(true);
            setQuery("");
          }}
          onBlur={handleBlur}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          className={cn(
            "h-11 w-full min-w-0 rounded-xl border border-border bg-card px-3.5 text-base text-foreground shadow-[var(--shadow-sm)] placeholder:text-muted-foreground/80 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_18%,transparent)]",
            error && "border-danger",
          )}
          aria-expanded={open}
          aria-invalid={Boolean(error)}
          aria-controls={`${name}-cattle-list`}
          role="combobox"
        />
        {open ? (
          <ul
            id={`${name}-cattle-list`}
            role="listbox"
            className="mt-1.5 max-h-44 overflow-y-auto overscroll-contain rounded-xl border border-border bg-card py-1 shadow-md"
          >
            {emptyOption ? (
              <li>
                <button
                  type="button"
                  className="flex w-full px-3 py-2.5 text-left text-base text-muted-foreground hover:bg-muted"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(emptyOption.value)}
                >
                  {emptyOption.label}
                </button>
              </li>
            ) : null}
            {matches.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-muted-foreground">{t("cattle.noCattle")}</li>
            ) : (
              matches.map((cattle) => {
                const id = String(cattle.id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={id === value}
                      className={cn(
                        "flex w-full min-w-0 px-3 py-2.5 text-left text-base hover:bg-muted",
                        id === value && "bg-muted font-medium",
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => pick(id)}
                    >
                      <span className="truncate">{cattleChoiceLabel(cattle)}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        ) : null}
      </div>
      {error ? <span className="text-sm text-danger">{error}</span> : null}
    </div>
  );
}
