"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { LoopLogo } from "@/components/loop-logo";
import { DiffLoopCanvas } from "@/components/home-landing/diff-loop-canvas";
import { FeatureCard } from "@/components/home-landing/feature-card";

const HeroShader = dynamic(
  () =>
    import("@/components/home-landing/hero-shader").then((m) => ({
      default: m.HeroShader,
    })),
  { ssr: false }
);

const FEATURES = [
  {
    icon: "◉",
    title: "Continuous monitoring",
    description:
      "Loop watches your source repos, docs, and APIs. When something changes upstream, it flags the skills that need attention.",
  },
  {
    icon: "⟐",
    title: "Automated diffs",
    description:
      "An agent proposes targeted updates to your skill files — model swaps, parameter tuning, new tool integrations — as reviewable diffs.",
  },
  {
    icon: "△",
    title: "Eval-gated deploys",
    description:
      "Every proposed change runs through benchmarks before it lands. Skills only update when they measurably improve.",
  },
] as const;

export function LandingShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080a] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <HeroShader />
      </div>

      <nav className="relative z-10 mx-auto flex max-w-[1100px] items-center justify-between px-6 pt-6">
        <Link href="/home" className="flex items-center gap-2.5">
          <LoopLogo className="h-7 w-7 text-[#e8650a]" />
          <span className="text-base font-semibold tracking-tight text-white/90">
            Loop
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-white/50 transition-colors hover:text-white/80"
          >
            Dashboard
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:bg-white/15"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-[1100px] place-items-center gap-10 px-6 pt-24 pb-32 lg:pt-32">
        <div className="grid gap-5 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#e8650a]/60">
            Stay in the loop
          </p>
          <h1 className="mx-auto max-w-[680px] text-balance font-serif text-5xl font-medium leading-[1.1] tracking-tight text-white lg:text-6xl">
            Skills that never{"\u00A0"}go{"\u00A0"}stale
          </h1>
          <p className="mx-auto max-w-[540px] text-balance text-lg leading-relaxed text-white/45">
            Self-improving skills mean self-improving agents. Loop
            continuously monitors, evaluates, and updates your playbooks —
            so every skill evolves on its own.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-px rounded-[18px] bg-linear-to-b from-[#e8650a]/10 to-transparent" />
          <DiffLoopCanvas className="relative rounded-2xl shadow-2xl shadow-[#e8650a]/5" />
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-[#e8650a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Open Dashboard
          </Link>
          <Link
            href="#features"
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-[#e8650a]/40 hover:text-white"
          >
            Learn more
          </Link>
        </div>
      </section>

      <section
        id="features"
        className="relative z-10 mx-auto max-w-[1100px] px-6 pb-32"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>
    </div>
  );
}
