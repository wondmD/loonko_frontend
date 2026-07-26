import { cn } from "@/lib/utils/cn";
import { type TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const areaId = id || props.name;
    return (
      <label className="flex w-full flex-col gap-1.5 text-sm">
        {label ? <span className="font-medium text-foreground">{label}</span> : null}
        <textarea
          ref={ref}
          id={areaId}
          className={cn(
            "min-h-28 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-foreground shadow-sm focus:border-ring",
            error && "border-danger",
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </label>
    );
  },
);
Textarea.displayName = "Textarea";
