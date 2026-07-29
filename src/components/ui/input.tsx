import { cn } from "@/lib/utils/cn";
import { type InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <label className="flex w-full flex-col gap-1.5 text-base">
        {label ? (
          <span className="font-medium text-foreground">{label}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-card px-3.5 text-base text-foreground shadow-[var(--shadow-sm)] transition placeholder:text-muted-foreground/80 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_18%,transparent)]",
            error && "border-danger",
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? <span className="text-sm text-danger">{error}</span> : null}
        {!error && hint ? (
          <span className="text-sm text-muted-foreground">{hint}</span>
        ) : null}
      </label>
    );
  },
);
Input.displayName = "Input";
