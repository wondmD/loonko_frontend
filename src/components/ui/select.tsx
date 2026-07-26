import { cn } from "@/lib/utils/cn";
import { type SelectHTMLAttributes, forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ label: string; value: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <label className="flex w-full flex-col gap-1.5 text-sm">
        {label ? <span className="font-medium text-foreground">{label}</span> : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-card px-3.5 text-[0.95rem] text-foreground shadow-[var(--shadow-sm)] focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_18%,transparent)]",
            error && "border-danger",
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </label>
    );
  },
);
Select.displayName = "Select";
