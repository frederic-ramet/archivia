"use client";

import { useTranslation } from "@/lib/i18n/context";

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as "fr" | "en")}
      className="bg-white/10 border border-white/20 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/30"
    >
      <option value="fr" className="text-gray-900">
        FR
      </option>
      <option value="en" className="text-gray-900">
        EN
      </option>
    </select>
  );
}
