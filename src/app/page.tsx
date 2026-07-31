"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Baby,
  Beef,
  CalendarClock,
  CheckCircle2,
  Dna,
  HeartPulse,
  Milk,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LanguageSelector } from "@/components/ui/language-selector";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore, useUiStore } from "@/stores/auth-store";
import { Moon, Sun } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.55, ease },
  }),
};

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { t } = useTranslation();
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (isHydrated && isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  const features = [
    {
      icon: Milk,
      title: t("landing.featureMilkTitle"),
      desc: t("landing.featureMilkDesc"),
      accent: "from-emerald-500/20 to-teal-500/5",
      iconTone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      icon: HeartPulse,
      title: t("landing.featureHerdTitle"),
      desc: t("landing.featureHerdDesc"),
      accent: "from-teal-500/20 to-emerald-500/5",
      iconTone: "text-teal-600 dark:text-teal-400 bg-teal-500/10",
    },
    {
      icon: CalendarClock,
      title: t("landing.featureHusbandryTitle"),
      desc: t("landing.featureHusbandryDesc"),
      accent: "from-amber-500/20 to-orange-500/5",
      iconTone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    {
      icon: ShieldCheck,
      title: t("landing.featureHealthTitle"),
      desc: t("landing.featureHealthDesc"),
      accent: "from-blue-500/20 to-indigo-500/5",
      iconTone: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
    {
      icon: Dna,
      title: t("landing.featureBreedingTitle"),
      desc: t("landing.featureBreedingDesc"),
      accent: "from-purple-500/20 to-pink-500/5",
      iconTone: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    },
    {
      icon: Wallet,
      title: t("landing.featureFinanceTitle"),
      desc: t("landing.featureFinanceDesc"),
      accent: "from-emerald-500/20 to-amber-500/5",
      iconTone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
  ];

  const roles = [
    {
      title: t("landing.roleOwner"),
      desc: t("landing.roleOwnerDesc"),
      icon: ShieldCheck,
      badge: "Full Admin",
    },
    {
      title: t("landing.roleWorker"),
      desc: t("landing.roleWorkerDesc"),
      icon: Users,
      badge: "Daily Operations",
    },
    {
      title: t("landing.roleVet"),
      desc: t("landing.roleVetDesc"),
      icon: Activity,
      badge: "Clinical Care",
    },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/loonkoo-logo.png"
              alt="Loonkoo Logo"
              width={34}
              height={34}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
              {t("appName")}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-card hover:bg-muted/50 transition border border-border text-foreground shadow-xs"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <LanguageSelector variant="header" />
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-foreground/80 hover:text-foreground sm:inline-block transition-colors"
            >
              {t("landing.signIn")}
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90"
            >
              {t("landing.createFarm")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.15), transparent 65%), radial-gradient(ellipse 50% 40% at 85% 90%, rgba(245,158,11,0.08), transparent 50%)",
          }}
        />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("landing.heroBadge")}</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-tight"
            >
              {t("landing.heroTitle")}
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-xl"
            >
              {t("landing.heroSubtitle")}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
              >
                <span>{t("landing.createFarm")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground shadow-xs transition hover:bg-muted/70"
              >
                {t("landing.signIn")}
              </Link>
            </motion.div>
          </div>

          {/* Quick Metrics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease }}
            className="mt-16 grid gap-4 sm:grid-cols-3 lg:gap-6"
          >
            {[
              {
                title: "100% Dedicated",
                sub: "Built specifically for Ethiopian dairy farms & local practices.",
              },
              {
                title: "Multilingual Support",
                sub: "Full localization in Amharic, Afan Oromo, and English.",
              },
              {
                title: "Automated Husbandry",
                sub: "Smart alerts for VWP, AI windows, pregnancy checks & dry-off.",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition-all hover:border-primary/30"
              >
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{stat.title}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{stat.sub}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Overview Grid */}
      <section id="features" className="border-t border-border/60 bg-muted/20 py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t("landing.overviewTitle")}
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              {t("landing.overviewSubtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.iconTone} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard Mockup Showcase */}
      <section className="bg-muted/30 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
              Powerful Analytics at Your Fingertips
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Monitor your entire herd, track milk production trends, and manage finances securely from one beautifully designed interface.
            </p>
          </div>
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-border border-8 border-background bg-card mx-auto max-w-5xl">
            <Image
              src="/brand/dashboard_preview.png"
              alt="Loonkoo Dashboard Preview"
              width={1600}
              height={900}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Access Roles */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t("landing.rolesTitle")}
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              {t("landing.rolesSubtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="rounded-2xl border border-border/70 bg-card p-7 shadow-xs transition-all hover:border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                      {r.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-foreground">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {r.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="border-t border-border/60 bg-card py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-emerald-500/10 to-teal-500/15 p-8 sm:p-14 text-center shadow-md">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t("landing.ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
              >
                <span>{t("landing.ctaButton")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/loonkoo-logo.png"
              alt="Loonkoo Logo"
              width={26}
              height={26}
              className="h-6 w-6 object-contain"
            />
            <span className="font-display text-base font-extrabold text-foreground">
              {t("appName")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t("landing.copyright")}</p>
          <div>
            <LanguageSelector variant="header" />
          </div>
        </div>
      </footer>
    </div>
  );
}
