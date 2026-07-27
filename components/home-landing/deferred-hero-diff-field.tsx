"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroDiffField = dynamic(
  async () => {
    const heroDiff = await import("@/components/home-landing/hero-diff-field");
    return heroDiff.HeroDiffField;
  },
  { ssr: false }
);

const POSTER_LINES = [
  { marker: " ", text: "## Motion and interaction", tone: "context" },
  { marker: "−", text: "Animate the entire page on load.", tone: "removed" },
  { marker: "+", text: "Keep useful initial HTML visible.", tone: "added" },
  { marker: "+", text: "Enhance leaf interactions after idle.", tone: "added" },
  { marker: " ", text: "Respect reduced-motion preferences.", tone: "context" },
] as const;

function HeroDiffPoster() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden [perspective:1000px]"
    >
      <div className="absolute left-1/2 top-1/2 h-[280px] w-[460px] -translate-x-[104%] -translate-y-1/2 rotate-y-[18deg] border border-line/70 bg-panel/55 shadow-xl max-sm:hidden" />
      <div className="absolute left-1/2 top-1/2 h-[280px] w-[460px] translate-x-[4%] -translate-y-1/2 -rotate-y-[18deg] border border-line/70 bg-panel/55 shadow-xl max-sm:hidden" />
      <div className="relative w-[min(92vw,540px)] overflow-hidden rounded-sm border border-line bg-panel shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line bg-surface-subtle px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          <span className="font-serif text-[0.8rem] font-medium text-ink">
            Frontend Frontier
          </span>
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
            Frontend
          </span>
          <span className="rounded border border-line px-2 py-0.5 text-[0.55rem] tabular-nums text-ink-faint">
            v6 → <strong className="text-ink">v7</strong>
          </span>
          <span className="ml-auto text-[0.55rem] font-bold text-emerald-600 dark:text-emerald-400">
            +2
          </span>
        </div>
        <div className="h-[250px] bg-panel py-3 font-mono">
          {POSTER_LINES.map((line, index) => (
            <div
              className={
                line.tone === "added"
                  ? "grid grid-cols-[2rem_1rem_1fr] bg-emerald-500/10 px-2 py-1 text-emerald-800 dark:text-emerald-300"
                  : line.tone === "removed"
                    ? "grid grid-cols-[2rem_1rem_1fr] bg-red-500/10 px-2 py-1 text-red-800 line-through dark:text-red-300"
                    : "grid grid-cols-[2rem_1rem_1fr] px-2 py-1 text-ink-soft"
              }
              key={line.text}
            >
              <span className="text-right text-[0.55rem] tabular-nums text-ink-faint">
                {index + 18}
              </span>
              <span className="text-center text-[0.65rem] font-bold">
                {line.marker}
              </span>
              <span className="truncate text-[0.65rem] no-underline">
                {line.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DeferredHeroDiffField() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => setReady(true), {
        timeout: 1000,
      });
    } else {
      timerId = setTimeout(() => setReady(true), 200);
    }

    return () => {
      if (idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
    };
  }, []);

  return (
    <div className="relative mx-auto h-[340px] w-full max-w-[1000px] sm:h-[380px]">
      <HeroDiffPoster />
      {ready ? (
        <div className="relative z-10">
          <HeroDiffField />
        </div>
      ) : null}
    </div>
  );
}
