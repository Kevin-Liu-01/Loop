"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import type { LandingSkillCard, LandingTimelineEntry } from "@/lib/home-landing/landing-data";

const toneColor: Record<string, string> = {
  fresh: "bg-emerald-500",
  stale: "bg-amber-500",
  idle: "bg-zinc-500",
};

const toneGlow: Record<string, string> = {
  fresh: "shadow-[0_0_8px_rgba(16,185,129,0.15)]",
  stale: "shadow-[0_0_8px_rgba(245,158,11,0.15)]",
  idle: "",
};

const badgeColor: Record<string, string> = {
  "model-swap": "bg-sky-500/12 text-sky-400/65",
  parameter: "bg-violet-500/12 text-violet-400/65",
  "tool-add": "bg-emerald-500/12 text-emerald-400/65",
  guardrail: "bg-amber-500/12 text-amber-400/65",
};

type Props = {
  skill: LandingSkillCard;
  timeline?: LandingTimelineEntry[];
  index?: number;
};

export function LandingSkillCardEl({ skill, timeline, index = 0 }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative grid cursor-pointer gap-3 rounded-2xl border p-5 text-left transition-all",
        expanded
          ? "border-white/[0.08] bg-white/[0.03]"
          : "border-white/[0.04] bg-white/[0.015] hover:border-white/[0.07] hover:bg-white/[0.025]"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-[5px] inline-block h-[9px] w-[9px] shrink-0 rounded-full",
            toneColor[skill.tone],
            toneGlow[skill.tone]
          )}
        />
        <div className="min-w-0 flex-1 grid gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-serif text-[0.95rem] font-medium text-white/90">{skill.title}</span>
            <span className="inline-flex h-[22px] items-center rounded-md border border-white/[0.06] bg-white/[0.03] px-2 text-[0.62rem] font-medium tracking-wide text-white/40">
              {skill.category}
            </span>
            <span className="inline-flex h-[22px] items-center rounded-md bg-white/[0.02] px-2 font-mono text-[0.58rem] tabular-nums text-white/28">
              {skill.version}
            </span>
          </div>
          <p className="m-0 line-clamp-1 text-[0.82rem] leading-snug text-white/35">{skill.description}</p>
          <div className="flex items-center gap-2 text-[0.62rem] text-white/20">
            <span className="tabular-nums">{skill.updatedAt}</span>
            <span className="text-white/10">·</span>
            <span>{skill.origin}</span>
          </div>
        </div>
        <span
          className={cn(
            "mt-1.5 text-[0.55rem] text-white/20 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        >
          ▾
        </span>
      </div>

      <AnimatePresence>
        {expanded && timeline && timeline.length > 0 ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.05] pt-3.5 pl-[21px]">
              <div className="relative grid gap-3">
                <div className="absolute top-1.5 bottom-1.5 left-[3.5px] w-px bg-gradient-to-b from-white/[0.08] to-transparent" />
                {timeline.map((entry, i) => (
                  <motion.div
                    key={entry.version}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="relative grid gap-1 pl-5"
                  >
                    <div className="absolute left-0 top-[7px] h-2 w-2 rounded-full border border-white/12 bg-[#0c0c0e]" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.62rem] font-medium tabular-nums text-white/45">{entry.version}</span>
                      <span className="text-[0.58rem] tabular-nums text-white/18">{entry.date}</span>
                      {entry.badge ? (
                        <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[0.52rem] font-medium", badgeColor[entry.badge] ?? "bg-white/[0.04] text-white/30")}>
                          {entry.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="m-0 text-[0.72rem] leading-snug text-white/30">{entry.summary}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}
