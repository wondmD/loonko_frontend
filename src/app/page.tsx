"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth-store";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.1, duration: 0.55, ease },
  }),
};

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (isHydrated && isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#eef4f0] text-sm text-[#5c6f65]">
        Opening your farm…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#eef4f0] text-[#14241c]">
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/brand/loonkoo-logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="font-display text-lg font-extrabold tracking-tight">Loonkoo</span>
        </Link>
        <Link
          href="/login"
          className="text-sm font-semibold text-[#2f553c] underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </header>

      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(47,85,60,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(184,90,40,0.08), transparent 50%), linear-gradient(180deg, #eef4f0 0%, #e4ede7 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-3xl opacity-[0.18] sm:opacity-[0.22]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease }}
            className="absolute top-1/2 right-[-8%] h-[min(90vw,42rem)] w-[min(90vw,42rem)] -translate-y-1/2 sm:right-[-4%]"
          >
            <Image
              src="/brand/loonkoo-logo.png"
              alt=""
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 90vw, 42rem"
            />
          </motion.div>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-6xl flex-col justify-center px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-6">
          <div className="max-w-xl">
            <motion.p
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="font-display text-5xl font-extrabold tracking-tight text-[#2f553c] sm:text-6xl md:text-7xl"
            >
              Loonkoo
            </motion.p>
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-4 max-w-md font-display text-2xl font-semibold tracking-tight text-[#14241c] sm:text-3xl"
            >
              Dairy days, clearly tracked.
            </motion.h1>
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-4 max-w-md text-base leading-relaxed text-[#5c6f65] sm:text-lg"
            >
              Milk, herd care, and farm numbers in one simple place — built for Ethiopian dairy
              farms.
            </motion.p>
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#2f553c] px-6 text-sm font-semibold text-[#f4faf7] transition hover:brightness-110"
              >
                Create your farm
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold text-[#2f553c] transition hover:bg-[#2f553c]/8"
              >
                Sign in
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#2f553c]/12 bg-[#f7faf8]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-3 sm:gap-8 sm:px-8 sm:py-20">
          {[
            {
              title: "Milk",
              body: "Log morning and evening yields, watch trends, and keep production honest.",
            },
            {
              title: "Herd",
              body: "Know each animal’s stage, breeding status, and what care is due next.",
            },
            {
              title: "Farm numbers",
              body: "See income and costs clearly — including milk value when you want it.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <h2 className="font-display text-xl font-bold tracking-tight text-[#2f553c]">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5c6f65] sm:text-[0.95rem]">
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#2f553c]/10 bg-[#eef4f0]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/loonkoo-logo.png"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
            <span className="font-display text-sm font-bold">Loonkoo</span>
          </div>
          <p className="text-xs text-[#5c6f65]">Dairy farm tracker for everyday work.</p>
        </div>
      </footer>
    </div>
  );
}
