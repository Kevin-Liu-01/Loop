"use client";

import { useMemo } from "react";

import { Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { useAppTimezone } from "@/hooks/use-app-timezone";
import { SUGGESTED_TIME_ZONES } from "@/lib/usage-timezones";

const sectionLabel =
  "text-[0.65rem] font-medium uppercase tracking-[0.08em] text-ink-soft";

export function TimezonePicker() {
  const { timeZone, setTimeZone, browserTimeZone } = useAppTimezone();

  const options = useMemo(() => {
    const set = new Set<string>(SUGGESTED_TIME_ZONES);
    set.add(browserTimeZone);
    set.add(timeZone);

    let allZones: string[] = [];
    try {
      allZones = Intl.supportedValuesOf("timeZone");
    } catch {
      allZones = [...set];
    }

    const suggested = new Set(SUGGESTED_TIME_ZONES as readonly string[]);
    suggested.add(browserTimeZone);

    const suggestedOptions = [...suggested]
      .toSorted((a, b) => a.localeCompare(b))
      .map((z) => ({
        label: z === browserTimeZone ? `${z} (browser default)` : z,
        value: z,
      }));

    const otherOptions = allZones
      .filter((z) => !suggested.has(z))
      .map((z) => ({ label: z, value: z }));

    return [...suggestedOptions, ...otherOptions];
  }, [browserTimeZone, timeZone]);

  return (
    <Panel compact square className="grid gap-4">
      <div className="grid gap-1">
        <span className={sectionLabel}>Time zone</span>
        <p className="m-0 text-sm text-ink-muted">
          All dates and times throughout Loop are displayed in this zone.
        </p>
      </div>
      <Select
        className="min-h-0 rounded-none border-line bg-paper-3/60 px-4 py-2.5 text-sm font-medium dark:bg-paper-2/30"
        onChange={setTimeZone}
        options={options}
        value={timeZone}
      />
      <p className="m-0 text-xs text-ink-faint">
        Browser detected:{" "}
        <strong className="font-medium text-ink-soft">{browserTimeZone}</strong>
      </p>
    </Panel>
  );
}
