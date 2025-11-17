"use client";

import { SessionProvider } from "next-auth/react";
import { PWARegister } from "./pwa-register";
import { I18nProvider } from "@/lib/i18n/context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <PWARegister />
        {children}
      </I18nProvider>
    </SessionProvider>
  );
}
