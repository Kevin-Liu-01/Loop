"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { LANDING_PIPELINE_STEPS } from "@/lib/home-landing/landing-data";

function StepButton({
  step,
  active,
  index,
  onSelect,
}: {
  step: { id: string; label: string; mono: string };
  active: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all",
        active
          ? "bg-white/[0.04] shadow-[inset_0_0_0_1px_rgba(232,101,10,0.18),0_0_32px_-8px_rgba(232,101,10,0.08)]"
          : "hover:bg-white/[0.02]"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-[0.75rem] font-bold tabular-nums transition-all",
          active
            ? "bg-[#e8650a] text-white shadow-[0_0_16px_rgba(232,101,10,0.35)]"
            : "bg-white/[0.04] text-white/30 group-hover:text-white/45"
        )}
      >
        {index + 1}
      </span>
      <div className="grid gap-1">
        <span
          className={cn(
            "font-serif text-[0.95rem] font-medium transition-colors",
            active ? "text-white" : "text-white/45"
          )}
        >
          {step.label}
        </span>
        <span className="font-mono text-[0.6rem] text-white/18">{step.mono}</span>
      </div>
      {active ? (
        <motion.div
          layoutId="pipeline-indicator"
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-[#e8650a]"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      ) : null}
    </button>
  );
}

export function LandingPipeline() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = LANDING_PIPELINE_STEPS[activeIdx]!;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-0">
      <div className="grid content-start gap-1 lg:border-r lg:border-white/[0.04] lg:pr-8">
        {LANDING_PIPELINE_STEPS.map((step, i) => (
          <StepButton
            key={step.id}
            step={step}
            active={i === activeIdx}
            index={i}
            onSelect={() => setActiveIdx(i)}
          />
        ))}
      </div>

      <div className="relative flex min-h-[180px] items-center lg:pl-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4"
          >
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#e8650a]/60" />
              <span className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#e8650a]/50">
                Step {activeIdx + 1}
              </span>
            </div>
            <h3 className="m-0 font-serif text-2xl font-medium tracking-[-0.02em] text-white">{active.label}</h3>
            <p className="m-0 max-w-[38ch] text-[0.95rem] leading-[1.7] text-white/40">{active.description}</p>
            <div className="mt-1 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-3">
              <span className="font-mono text-[0.68rem] text-white/30">
                {active.mono === "source_change" && 'trigger = "source_change"\ninterval = "6h"\nnotify = ["slack", "email"]'}
                {active.mono === "benchmark" && 'benchmark = "mmlu-pro"\nthreshold = 0.92\nauto_rollback = true'}
                {active.mono === "diff_review" && 'diff_review = "auto"\nsandbox = "strict"\nrate_limit = "60/min"'}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
