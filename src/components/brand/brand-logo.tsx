import Image from "next/image";

import { cn } from "@/lib/utils/cn";

type BrandLogoProps = {
  className?: string;
  size?: number;
  priority?: boolean;
  /** Invert/lighten for dark backgrounds when needed via CSS filter */
  onDark?: boolean;
};

export function BrandLogo({
  className,
  size = 40,
  priority = false,
  onDark = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/brand/loonkoo-logo.png"
      alt="Loonkoo"
      width={size}
      height={size}
      priority={priority}
      className={cn(
        "shrink-0 object-contain",
        onDark && "brightness-0 invert",
        className,
      )}
    />
  );
}

export function BrandWordmark({
  className,
  logoSize = 36,
  showTagline = false,
  onDark = false,
  tagline = "Dairy farm tracker",
}: {
  className?: string;
  logoSize?: number;
  showTagline?: boolean;
  onDark?: boolean;
  tagline?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandLogo size={logoSize} onDark={onDark} priority />
      <div className="min-w-0">
        <p
          className={cn(
            "font-display text-xl font-extrabold tracking-tight",
            onDark ? "text-white" : "text-foreground",
          )}
        >
          Loonkoo
        </p>
        {showTagline ? (
          <p className={cn("text-xs", onDark ? "text-white/65" : "text-muted-foreground")}>
            {tagline}
          </p>
        ) : null}
      </div>
    </div>
  );
}
