"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { LANDING_SKILL_TOML, LANDING_DIFF_LINES } from "@/lib/home-landing/landing-data";

type Tab = "skill" | "diff";

function LineNumber({ n }: { n: number }) {
  return (
    <span className="mr-3 inline-block w-5 select-none text-right tabular-nums text-white/12">
      {n}
    </span>
  );
}

function TomlHighlight({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <code className="block text-[0.75rem] leading-[1.72]">
      {lines.map((line, i) => {
        const key = `${i}-${line}`;
        if (line.startsWith("[")) {
          return (
            <div key={key} className="mt-1 first:mt-0">
              <LineNumber n={i + 1} />
              <span className="font-semibold text-[#e8650a]/70">{line}</span>
            </div>
          );
        }
        const eqIdx = line.indexOf("=");
        if (eqIdx > 0) {
          const k = line.slice(0, eqIdx).trimEnd();
          const v = line.slice(eqIdx + 1).trimStart();
          return (
            <div key={key}>
              <LineNumber n={i + 1} />
              <span className="text-white/50">{k}</span>
              <span className="text-white/18"> = </span>
              <span className={v.startsWith('"') ? "text-emerald-400/50" : "text-sky-400/50"}>{v}</span>
            </div>
          );
        }
        if (line.trim() === "") return <div key={key} className="h-[1.72em]"><LineNumber n={i + 1} /></div>;
        return (
          <div key={key}>
            <LineNumber n={i + 1} />
            <span className="text-white/30">{line}</span>
          </div>
        );
      })}
    </code>
  );
}

function DiffBlock() {
  return (
    <code className="block text-[0.75rem] leading-[1.72]">
      {LANDING_DIFF_LINES.map((line, i) => {
        const key = `${i}-${line.text}`;
        if (line.kind === "added") {
          return (
            <div key={key} className="rounded-sm bg-emerald-500/[0.07] px-1 -mx-1">
              <span className="mr-2 inline-block w-3 select-none text-right text-emerald-500/50">+</span>
              <span className="text-emerald-400/65">{line.text}</span>
            </div>
          );
        }
        if (line.kind === "removed") {
          return (
            <div key={key} className="rounded-sm bg-red-500/[0.05] px-1 -mx-1">
              <span className="mr-2 inline-block w-3 select-none text-right text-red-400/45">−</span>
              <span className="text-red-400/45 line-through decoration-red-400/20">{line.text}</span>
            </div>
          );
        }
        if (line.text.trim() === "") return <div key={key} className="h-[1.72em]" />;
        return (
          <div key={key}>
            <span className="mr-2 inline-block w-3 select-none text-right text-white/8"> </span>
            <span className="text-white/25">{line.text}</span>
          </div>
        );
      })}
    </code>
  );
}

export function LandingTomlViewer({ className }: { className?: string }) {
  const [tab, setTab] = useState<Tab>("skill");
  const [cursorVisible, setCursorVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c0e] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {/* Window chrome */}
      <div className="flex items-center border-b border-white/[0.05] bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-[9px] w-[9px] rounded-full bg-white/[0.08]" />
          <span className="h-[9px] w-[9px] rounded-full bg-white/[0.08]" />
          <span className="h-[9px] w-[9px] rounded-full bg-white/[0.08]" />
        </div>
        <div className="ml-4 flex items-center gap-0">
          <button
            type="button"
            onClick={() => setTab("skill")}
            className={cn(
              "relative rounded-t-lg px-3.5 py-1.5 font-mono text-[0.65rem] font-medium transition-colors",
              tab === "skill" ? "bg-white/[0.03] text-white/65" : "text-white/22 hover:text-white/38"
            )}
          >
            reasoning-agent/v4.toml
            {tab === "skill" ? (
              <motion.div layoutId="toml-tab" className="absolute inset-x-1 bottom-0 h-[2px] rounded-full bg-[#e8650a]/50" />
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setTab("diff")}
            className={cn(
              "relative rounded-t-lg px-3.5 py-1.5 font-mono text-[0.65rem] font-medium transition-colors",
              tab === "diff" ? "bg-white/[0.03] text-white/65" : "text-white/22 hover:text-white/38"
            )}
          >
            v3 → v4 diff
            {tab === "diff" ? (
              <motion.div layoutId="toml-tab" className="absolute inset-x-1 bottom-0 h-[2px] rounded-full bg-[#e8650a]/50" />
            ) : null}
          </button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="h-[6px] w-[6px] rounded-full bg-emerald-500/50" />
          <span className="font-mono text-[0.55rem] tabular-nums text-white/18">
            eval passed · 0.93
          </span>
        </div>
      </div>

      <div className="relative max-h-[360px] overflow-auto p-4 font-mono">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "skill" ? <TomlHighlight text={LANDING_SKILL_TOML} /> : <DiffBlock />}
          </motion.div>
        </AnimatePresence>
        <span
          className={cn(
            "inline-block h-[14px] w-[7px] translate-y-[2px] bg-[#e8650a]/40 transition-opacity",
            cursorVisible ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </div>
  );
}
