"use client";

import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LANGUAGES, useTranslation, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

interface LanguageSelectorProps {
  variant?: "header" | "compact" | "full";
  className?: string;
}

export function LanguageSelector({ variant = "header", className }: LanguageSelectorProps) {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setOpen(false);
  };

  const currentLang = LANGUAGES[language] || LANGUAGES.en;

  if (variant === "full") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {Object.values(LANGUAGES).map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition",
                isSelected
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-border bg-card hover:bg-accent/10 text-foreground",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{lang.flag}</span>
                <div>
                  <p className="text-sm font-medium leading-none">{lang.nativeName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{lang.name}</p>
                </div>
              </div>
              {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={menuRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition border border-transparent hover:border-border hover:bg-muted/50",
          variant === "header" && "text-foreground",
          variant === "compact" && "bg-secondary text-secondary-foreground",
        )}
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 opacity-75" />
        <span className="inline-flex items-center gap-1">
          <span>{currentLang.flag}</span>
          <span>{currentLang.nativeName}</span>
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 z-50 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95">
          <p className="px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Language / ቋንቋ / Afaan
          </p>
          <div className="mt-1 flex flex-col gap-0.5">
            {Object.values(LANGUAGES).map((lang) => {
              const active = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-popover-foreground hover:bg-muted",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {active ? <Check className="h-3.5 w-3.5" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
