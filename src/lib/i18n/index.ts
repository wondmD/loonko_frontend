"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { en } from "./locales/en";
import { am } from "./locales/am";
import { om } from "./locales/om";

export type Language = "en" | "am" | "om";

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Record<Language, LanguageInfo> = {
  en: { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  am: { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
  om: { code: "om", name: "Afan Oromo", nativeName: "Afaan Oromoo", flag: "🇪🇹" },
};

const dictionaries = { en, am, om };

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => {
        if (typeof document !== "undefined") {
          document.documentElement.lang = language;
        }
        set({ language });
      },
    }),
    {
      name: "dft-language",
      onRehydrateStorage: () => (state) => {
        if (state?.language && typeof document !== "undefined") {
          document.documentElement.lang = state.language;
        }
      },
    },
  ),
);

/**
 * Get a nested value from dictionary by string dot path e.g. "nav.dashboard"
 */
function getNestedTranslation(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let curr: unknown = obj;
  for (const part of parts) {
    if (curr && typeof curr === "object" && part in (curr as Record<string, unknown>)) {
      curr = (curr as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof curr === "string" ? curr : undefined;
}

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[language] || dictionaries.en;
    let text = getNestedTranslation(dict as unknown as Record<string, unknown>, key);
    
    // Fallback to English dictionary if key is missing in chosen language
    if (!text && language !== "en") {
      text = getNestedTranslation(dictionaries.en as unknown as Record<string, unknown>, key);
    }
    
    // Fallback to raw key if missing in English too
    if (!text) {
      text = key;
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text!.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, "g"), String(paramVal));
      });
    }

    return text;
  };

  return {
    language,
    setLanguage,
    t,
    languages: Object.values(LANGUAGES),
    currentLanguage: LANGUAGES[language] || LANGUAGES.en,
  };
}
