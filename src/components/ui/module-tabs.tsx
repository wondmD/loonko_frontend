"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

export function ModuleTabs({
  items,
}: {
  items: Array<{ href: string; label: string; exact?: boolean }>;
}) {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-muted/70 p-1">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition",
              active
                ? "bg-card text-foreground shadow-[var(--shadow-sm)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
