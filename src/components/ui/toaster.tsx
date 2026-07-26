"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

import { useToastStore, type ToastTone } from "@/stores/toast-store";
import { cn } from "@/lib/utils/cn";

const TONE: Record<
  ToastTone,
  { icon: typeof CheckCircle2; className: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    className: "border-success/25 bg-card",
    iconClass: "text-success",
  },
  error: {
    icon: XCircle,
    className: "border-danger/25 bg-card",
    iconClass: "text-danger",
  },
  info: {
    icon: Info,
    className: "border-border bg-card",
    iconClass: "text-primary",
  },
};

export function Toaster() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:items-end lg:bottom-4"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const tone = TONE[item.tone];
          const Icon = tone.icon;
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-3.5 py-3 shadow-[var(--shadow-md)]",
                tone.className,
              )}
              role="status"
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone.iconClass)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-tight">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
