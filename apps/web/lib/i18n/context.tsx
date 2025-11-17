"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Locale, TranslationKey } from "./translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "archivia-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    // Load saved locale from localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (saved === "fr" || saved === "en")) {
      setLocaleState(saved);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "en") {
        setLocaleState("en");
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
