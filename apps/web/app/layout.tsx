import type { Metadata } from "next";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
