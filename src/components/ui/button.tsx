import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:brightness-110",
  secondary:
    "bg-card text-foreground border border-border hover:bg-muted/80",
  ghost: "bg-transparent text-foreground hover:bg-muted/70",
  danger: "bg-danger text-white hover:brightness-110",
  accent: "bg-accent text-accent-foreground hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
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
        "inline-flex min-w-11 items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  ),
);
Button.displayName = "Button";
