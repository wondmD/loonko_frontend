import type { ReactNode } from "react";

import { AuthSessionGuard } from "@/components/auth/auth-session-guard";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0a241c]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(77,184,146,0.28),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(196,92,38,0.22),transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-8 flex flex-col items-center text-center text-white">
          <a href="/" className="mb-4 transition opacity-90 hover:opacity-100">
            <BrandLogo size={72} onDark priority />
          </a>
          <a href="/" className="font-display text-4xl font-extrabold tracking-tight hover:opacity-90">
            Loonkoo
          </a>
          <p className="mt-2 text-sm text-white/70">Create and manage your own dairy farm</p>
        </div>
        <AuthSessionGuard>{children}</AuthSessionGuard>
      </div>
    </div>
  );
}
