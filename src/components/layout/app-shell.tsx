"use client";

import {
  Baby,
  Beef,
  Bell,
  CalendarClock,
  Dna,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Milk,
  Moon,
  Settings,
  Sun,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ProfileModal } from "@/components/profile/profile-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAlerts } from "@/features/alerts/hooks/use-alerts";
import { useFarm } from "@/features/farm/hooks/use-farm";
import { canAccess, NAV_GROUPS, NAV_ITEMS, ROLE_LABELS } from "@/lib/auth/access";
import { cn, displayName } from "@/lib/utils/cn";
import { useAuthStore, useUiStore } from "@/stores/auth-store";
import type { ModuleKey } from "@/types";

const ICONS = {
  LayoutDashboard,
  Beef,
  CalendarClock,
  Milk,
  HeartPulse,
  Dna,
  Baby,
  Wallet,
  Bell,
  Settings,
} as const;

const MOBILE_PRIMARY = ["/dashboard", "/cattle", "/milk", "/husbandry", "/alerts"] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const { data: farm } = useFarm();
  const unread = useAlerts().unread.data?.unread ?? 0;
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen } = useUiStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const nav = NAV_ITEMS.filter((item) => canAccess(user?.role, item.module as ModuleKey));
  const mobileNav = MOBILE_PRIMARY.map((href) => nav.find((item) => item.href === href)).filter(
    Boolean,
  ) as typeof nav;
  const activeLabel =
    [...nav]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      ?.label ?? "Loonkoo";

  const openProfile = () => {
    setSidebarOpen(false);
    setProfileOpen(true);
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {NAV_GROUPS.map((group) => {
        const items = nav.filter((item) => item.group === group.id);
        if (items.length === 0) return null;
        return (
          <div key={group.id}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/45 uppercase">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {items.map((item) => {
                const Icon = ICONS[item.icon];
                const moreSpecificMatch = nav.some(
                  (other) =>
                    other.href !== item.href &&
                    other.href.startsWith(`${item.href}/`) &&
                    (pathname === other.href || pathname.startsWith(`${other.href}/`)),
                );
                const active =
                  !moreSpecificMatch &&
                  (pathname === item.href || pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex min-h-10 items-center gap-3 rounded-lg px-3 text-[0.925rem] font-medium transition",
                      active
                        ? "bg-white/12 text-white"
                        : "text-sidebar-foreground/70 hover:bg-white/6 hover:text-white",
                    )}
                  >
                    <Icon
                      className={cn("h-[1.15rem] w-[1.15rem] shrink-0", active && "text-accent")}
                      strokeWidth={active ? 2.15 : 1.85}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/alerts" && unread > 0 ? (
                      <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                        {unread}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={34} onDark />
            <div className="min-w-0">
              <p className="font-display text-xl font-extrabold tracking-tight">Loonkoo</p>
              <p className="mt-0.5 truncate text-xs text-sidebar-foreground/55">
                {farm?.name || "Dairy farm"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={openProfile}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/8"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <UserRound className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {user ? displayName(user) : "—"}
              </span>
              <span className="mt-0.5 block text-xs text-sidebar-foreground/55">
                {user ? ROLE_LABELS[user.role] : ""} · Profile
              </span>
            </span>
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,17rem)] flex-col bg-sidebar text-sidebar-foreground shadow-[var(--shadow-md)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div className="flex items-center gap-2">
                <BrandLogo size={28} onDark />
                <p className="font-display text-lg font-extrabold">Loonkoo</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setSidebarOpen(false)} />
            </div>
            <div className="border-t border-white/10 p-3">
              <button
                type="button"
                onClick={openProfile}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/8"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {user ? displayName(user) : "—"}
                  </span>
                  <span className="text-xs text-sidebar-foreground/55">View profile</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight sm:text-[0.95rem]">
                {activeLabel}
              </p>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {farm?.name || "Your farm"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
            >
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => logout()} aria-label="Log out">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
          {mobileNav.map((item) => {
            const Icon = ICONS[item.icon];
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                <span className="truncate">{item.label}</span>
                {item.href === "/alerts" && unread > 0 ? (
                  <span className="absolute top-1 right-1/4 h-1.5 w-1.5 rounded-full bg-accent" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
