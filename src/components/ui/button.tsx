import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-primary/90 hover:shadow-[var(--shadow-md)]",
  secondary:
    "bg-card text-foreground border border-border/80 shadow-[var(--shadow-sm)] hover:bg-muted/70 hover:border-border",
  ghost: "bg-transparent text-foreground hover:bg-muted/60",
  danger: "bg-danger text-white shadow-[var(--shadow-sm)] hover:bg-danger/90",
  accent: "bg-accent text-accent-foreground shadow-[var(--shadow-sm)] hover:bg-accent/90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs font-semibold",
  md: "h-10 px-4 text-sm font-semibold",
  lg: "h-12 px-6 text-base font-semibold",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl tracking-tight transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = "Button";
