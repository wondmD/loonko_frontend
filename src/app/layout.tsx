import type { Metadata } from "next";

import { AppProviders } from "@/providers/app-providers";

import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans-next" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display-next" });

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
    <html lang="en" className={`h-full ${inter.variable} ${outfit.variable}`}>
      <body className="min-h-full font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
