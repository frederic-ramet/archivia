import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import InstallPWA from "@/components/pwa/InstallPWA";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Archivia - Plateforme Patrimoniale",
  description:
    "Plateforme de numérisation, analyse et valorisation du patrimoine culturel",
  keywords: [
    "patrimoine",
    "archive",
    "numérisation",
    "OCR",
    "histoire",
    "culture",
  ],
  manifest: "/manifest.json",
  themeColor: "#A67B5B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Archivia",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-heritage-50">
        <Providers>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
          <InstallPWA />
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}
