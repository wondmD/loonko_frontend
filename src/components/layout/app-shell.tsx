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
import { canAccess, NAV_GROUPS, NAV_ITEMS } from "@/lib/auth/access";
import { cn, displayName } from "@/lib/utils/cn";
import { useAuthStore, useUiStore } from "@/stores/auth-store";
import type { ModuleKey } from "@/types";

import { LanguageSelector } from "@/components/ui/language-selector";
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();
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

  const activeNavItem = [...nav]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  const activeLabel = activeNavItem ? t(`nav.${activeNavItem.module}`) : t("appName");

  const openProfile = () => {
    setSidebarOpen(false);
    setProfileOpen(true);
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-6 px-3.5 py-4">
      {NAV_GROUPS.map((group) => {
        const items = nav.filter((item) => item.group === group.id);
        if (items.length === 0) return null;
        return (
          <div key={group.id}>
            <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-sidebar-foreground/45 uppercase">
              {t(`navGroups.${group.id}`)}
            </p>
            <div className="flex flex-col gap-1">
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
                const navKey = item.href === '/breeding/calving' ? 'calving' : item.module;
                const itemLabel = t(`nav.${navKey}` as any);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex min-h-10 items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-white/12 text-white font-semibold shadow-xs"
                        : "text-sidebar-foreground/70 hover:bg-white/7 hover:text-white",
                    )}
                  >
                    {active ? (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                    ) : null}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                        active ? "text-primary-foreground" : "text-sidebar-foreground/60",
                      )}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    <span className="flex-1 truncate">{itemLabel}</span>
                    {item.href === "/alerts" && unread > 0 ? (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold text-accent-foreground shadow-xs">
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
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar text-sidebar-foreground shadow-lg lg:flex">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <BrandLogo size={36} onDark />
            <div className="min-w-0">
              <p className="font-display text-xl font-extrabold tracking-tight text-white">{t("appName")}</p>
              <p className="mt-0.5 truncate text-xs text-sidebar-foreground/60 font-medium">
                {farm?.name || t("appFullName")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="border-t border-white/10 p-3.5">
          <button
            type="button"
            onClick={openProfile}
            className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all duration-150 hover:bg-white/8"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white shadow-xs">
              <UserRound className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">
                {user ? displayName(user) : "—"}
              </span>
              <span className="mt-0.5 block truncate text-xs text-sidebar-foreground/60">
                {user?.role ? t(`roles.${user.role}`) : ""}
              </span>
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Slide-over Drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col bg-sidebar text-sidebar-foreground shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <BrandLogo size={30} onDark />
                <p className="font-display text-lg font-extrabold text-white">{t("appName")}</p>
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
            <div className="border-t border-white/10 p-3.5">
              <button
                type="button"
                onClick={openProfile}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/8"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {user ? displayName(user) : "—"}
                  </span>
                  <span className="text-xs text-sidebar-foreground/60">{t("profile.title")}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-card/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
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
              <p className="truncate font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
                {activeLabel}
              </p>
              <p className="hidden truncate text-xs text-muted-foreground sm:block font-medium">
                {farm?.name || t("tagline")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector variant="header" />

            <Link href="/alerts" className="relative">
              <Button variant="ghost" size="sm" aria-label="Alerts">
                <Bell className="h-4 w-4" />
                {unread > 0 ? (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                  </span>
                ) : null}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
              className="hidden sm:inline-flex"
            >
              <UserRound className="h-4 w-4" />
              <span>{t("profile.title")}</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={() => logout()} aria-label="Log out">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("auth.logout")}</span>
            </Button>
          </div>
        </header>

        {/* Content Container */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden shadow-lg">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1">
          {mobileNav.map((item) => {
            const Icon = ICONS[item.icon];
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const itemLabel = t(`nav.${item.module}`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-150",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                <span className="truncate">{itemLabel}</span>
                {active ? (
                  <span className="h-1 w-1 rounded-full bg-primary" />
                ) : null}
                {item.href === "/alerts" && unread > 0 ? (
                  <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-accent" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
