import type { Metadata } from "next";

import { AppProviders } from "@/providers/app-providers";

import "@fontsource-variable/source-sans-3/index.css";
import "@fontsource/syne/500.css";
import "@fontsource/syne/600.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Loonkoo — Dairy Farm Tracker",
  description: "Modern dairy farm management for milk, health, breeding, and finance.",
  icons: {
    icon: "/favicon.png",
    apple: "/brand/loonkoo-logo-180.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
