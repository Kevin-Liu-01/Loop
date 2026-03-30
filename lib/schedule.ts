const WEEKDAY_MAP: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6
};

const ALL_DAY_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;
const WEEKDAY_ONLY_INDICES = [1, 2, 3, 4, 5] as const;
const WEEKEND_INDICES = [0, 6] as const;

const DAY_LABEL_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
] as const;

const DAY_LABEL_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type ParsedRRule = {
  freq: string;
  interval: number;
  byDay: number[];
  byHour: number;
  byMinute: number;
};

/** Strip optional `RRULE:` prefix and whitespace (iCal vs bare string). */
export function normalizeAutomationRRule(schedule: string): string {
  const trimmed = schedule.trim();
  if (trimmed.length === 0) return "";
  const upper = trimmed.toUpperCase();
  if (upper.startsWith("RRULE:")) {
    return trimmed.slice(6).trim();
  }
  return trimmed;
}

function parseRRuleParts(normalized: string): Record<string, string> {
  const parts: Record<string, string> = {};
  for (const segment of normalized.split(";")) {
    const eq = segment.indexOf("=");
    if (eq === -1) continue;
    const key = segment.slice(0, eq).trim().toUpperCase();
    const value = segment.slice(eq + 1).trim();
    if (key) parts[key] = value;
  }
  return parts;
}

function parseRRule(rrule: string): ParsedRRule | null {
  const normalized = normalizeAutomationRRule(rrule);
  if (!normalized) return null;

  const parts = parseRRuleParts(normalized);

  const byDayStr = parts.BYDAY ?? "";
  const byDay = byDayStr
    ? byDayStr
        .split(",")
        .map((d) => WEEKDAY_MAP[d.trim().toUpperCase()] ?? -1)
        .filter((d) => d >= 0)
    : [...ALL_DAY_INDICES];

  const intervalRaw = parseInt(parts.INTERVAL ?? "1", 10);
  const interval = Number.isFinite(intervalRaw) && intervalRaw > 0 ? intervalRaw : 1;

  const byHourRaw = parseInt(parts.BYHOUR ?? "0", 10);
  const byMinuteRaw = parseInt(parts.BYMINUTE ?? "0", 10);
  const byHour = Number.isFinite(byHourRaw) ? Math.min(23, Math.max(0, byHourRaw)) : 0;
  const byMinute = Number.isFinite(byMinuteRaw) ? Math.min(59, Math.max(0, byMinuteRaw)) : 0;

  return {
    freq: (parts.FREQ ?? "DAILY").toUpperCase(),
    interval,
    byDay,
    byHour,
    byMinute
  };
}

function sortedUniqueDays(days: number[]): number[] {
  return [...new Set(days)].sort((a, b) => a - b);
}

function sameDaySet(days: number[], reference: readonly number[]): boolean {
  const a = sortedUniqueDays(days);
  const b = [...reference].sort((x, y) => x - y);
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function formatTime12h(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";
  const mm = minute.toString().padStart(2, "0");
  return `${h12}:${mm} ${ampm}`;
}

/** Human-readable automation schedule from an RRULE-like string (any BYDAY order; supports `RRULE:` prefix). */
export function formatAutomationSchedule(schedule: string): string {
  if (!schedule.trim()) {
    return "Manual";
  }

  const normalized = normalizeAutomationRRule(schedule);
  const parsed = parseRRule(normalized);
  if (!parsed) {
    return schedule;
  }

  if (parsed.freq === "HOURLY") {
    if (parsed.interval <= 1) {
      return "Every hour";
    }
    return `Every ${parsed.interval} hours`;
  }

  const time = formatTime12h(parsed.byHour, parsed.byMinute);
  const days = sortedUniqueDays(parsed.byDay);

  if (sameDaySet(days, ALL_DAY_INDICES)) {
    return `Daily · ${time}`;
  }
  if (sameDaySet(days, WEEKDAY_ONLY_INDICES)) {
    return `Weekdays · ${time}`;
  }
  if (sameDaySet(days, WEEKEND_INDICES)) {
    return `Weekends · ${time}`;
  }
  if (days.length === 1) {
    const d = days[0]!;
    return `${DAY_LABEL_LONG[d]} · ${time}`;
  }

  const dayPart = days.map((d) => DAY_LABEL_SHORT[d]).join(", ");
  return `${dayPart} · ${time}`;
}

export function getRunDatesForMonth(rrule: string, year: number, month: number): Date[] {
  const parsed = parseRRule(rrule);
  if (!parsed) return [];

  const dates: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  if (parsed.freq === "HOURLY") {
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }
    return dates;
  }

  const byDaySet = new Set(parsed.byDay);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (byDaySet.has(date.getDay())) {
      dates.push(date);
    }
  }

  return dates;
}

export function getNextRunDate(rrule: string): Date | null {
  const parsed = parseRRule(rrule);
  if (!parsed) return null;

  const now = new Date();
  const byDaySet = new Set(parsed.byDay);

  for (let offset = 0; offset < 14; offset++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    candidate.setHours(parsed.byHour, parsed.byMinute, 0, 0);

    if (parsed.freq === "HOURLY") {
      if (offset === 0) {
        const nextHour = Math.ceil(now.getHours() / parsed.interval) * parsed.interval;
        candidate.setHours(nextHour, 0, 0, 0);
        if (candidate > now) return candidate;
        candidate.setDate(candidate.getDate() + 1);
        candidate.setHours(0, 0, 0, 0);
      }
      return candidate;
    }

    if (!byDaySet.has(candidate.getDay())) continue;
    if (candidate > now) return candidate;
  }

  return null;
}

export function countMonthlyRuns(rrule: string, year: number, month: number): number {
  return getRunDatesForMonth(rrule, year, month).length;
}

/** True when the given calendar day is included in the RRULE’s projected runs for that month. */
export function isRRuleScheduledOnDate(rrule: string, date: Date): boolean {
  const dates = getRunDatesForMonth(rrule, date.getFullYear(), date.getMonth());
  return dates.some(
    (d) =>
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
  );
}

export function formatNextRun(rrule: string): string {
  const next = getNextRunDate(rrule);
  if (!next) return "—";

  const now = new Date();
  const diff = next.getTime() - now.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (hours < 1) return "< 1h";
  if (hours < 24) return `in ${hours}h`;
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days} days`;

  return next.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
