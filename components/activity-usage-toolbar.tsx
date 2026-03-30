"use client";

import { useMemo } from "react";

import { useTimezone } from "@/hooks/use-timezone";
import {
  USAGE_COMPARISON_LABELS,
  USAGE_COMPARISON_MODES,
  type UsageComparisonMode,
} from "@/lib/usage-comparison-modes";
import { SUGGESTED_TIME_ZONES } from "@/lib/usage-timezones";
import type { UsageOverview } from "@/lib/usage";
import { cn } from "@/lib/cn";

import { useUsageComparisonOptional } from "@/components/usage-comparison-context";

const selectClass =
  "h-8 min-w-0 max-w-full rounded-none border border-line bg-paper-3 px-2 text-xs text-ink dark:bg-paper-2/90";

export function ActivityUsageToolbar({ overview }: { overview: UsageOverview }) {
  const ctx = useUsageComparisonOptional();
  const mode = ctx?.mode ?? "yesterday_same_time";
  const setMode = ctx?.setMode;
  const { timeZone, setTimeZone, browserTimeZone } = useTimezone(overview.timeZone);

  const zoneOptions = useMemo(() => {
    const set = new Set<string>([...SUGGESTED_TIME_ZONES]);
    set.add(browserTimeZone);
    set.add(timeZone);
    set.add(overview.timeZone);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [browserTimeZone, timeZone, overview.timeZone]);

  const footnote = overview.comparisonFootnotes[mode];

  return (
    <div className="grid gap-2 border-b border-line/80 pb-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid min-w-0 gap-1">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
            Compare to
          </span>
          <select
            className={cn(selectClass, !setMode && "opacity-60")}
            disabled={!setMode}
            value={mode}
            onChange={(e) => setMode?.(e.target.value as UsageComparisonMode)}
          >
            {USAGE_COMPARISON_MODES.map((m) => (
              <option key={m} value={m}>
                {USAGE_COMPARISON_LABELS[m]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 flex-1 gap-1">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
            Time zone
          </span>
          <select
            className={selectClass}
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
          >
            {zoneOptions.map((z) => (
              <option key={z} value={z}>
                {z === browserTimeZone ? `${z} (browser)` : z}
              </option>
            ))}
          </select>
        </label>
      </div>
      {footnote ? (
        <p className="m-0 text-[0.62rem] leading-snug text-ink-faint">{footnote}</p>
      ) : null}
    </div>
  );
}
