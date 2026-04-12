import type { UserSkillCadence } from "@/lib/types";

export const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Paused", value: "PAUSED" },
] as const;

// ---------------------------------------------------------------------------
// Cadence options – selectable vs coming-soon
// ---------------------------------------------------------------------------

export interface CadenceOption {
  value: string;
  label: string;
  disabled?: boolean;
  badge?: string;
}

export const SUPPORTED_CADENCES: UserSkillCadence[] = [
  "daily",
  "weekly",
  "manual",
];

export const CADENCE_ALL_OPTIONS: CadenceOption[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  {
    badge: "Coming soon",
    disabled: true,
    label: "Every 12 hours",
    value: "every_12h",
  },
  {
    badge: "Coming soon",
    disabled: true,
    label: "Every 6 hours",
    value: "every_6h",
  },
  { badge: "Coming soon", disabled: true, label: "Hourly", value: "hourly" },
  { label: "Manual", value: "manual" },
];

/** Selectable-only subset used by programmatic logic that doesn't need coming-soon items. */
export const CADENCE_SIMPLE_OPTIONS = CADENCE_ALL_OPTIONS.filter(
  (o) => !o.disabled
) as CadenceOption[];

// ---------------------------------------------------------------------------
// Cron time slots – 24 hourly slots across the day (UTC)
// ---------------------------------------------------------------------------

export interface CronSlot {
  hour: number;
  label: string;
  description: string;
}

export const CRON_SLOTS: CronSlot[] = [
  { description: "Asia-Pacific morning", hour: 0, label: "12:00 AM UTC" },
  { description: "East Asia midday", hour: 1, label: "1:00 AM UTC" },
  { description: "East Asia afternoon", hour: 2, label: "2:00 AM UTC" },
  { description: "India morning", hour: 3, label: "3:00 AM UTC" },
  { description: "India midday", hour: 4, label: "4:00 AM UTC" },
  { description: "Europe early morning", hour: 5, label: "5:00 AM UTC" },
  { description: "Europe morning", hour: 6, label: "6:00 AM UTC" },
  { description: "UK morning", hour: 7, label: "7:00 AM UTC" },
  { description: "Europe work hours", hour: 8, label: "8:00 AM UTC" },
  { description: "Europe midday", hour: 9, label: "9:00 AM UTC" },
  { description: "US East early morning", hour: 10, label: "10:00 AM UTC" },
  { description: "US East morning", hour: 11, label: "11:00 AM UTC" },
  { description: "US East midday", hour: 12, label: "12:00 PM UTC" },
  { description: "US East afternoon", hour: 13, label: "1:00 PM UTC" },
  { description: "US West morning", hour: 14, label: "2:00 PM UTC" },
  { description: "US West midday", hour: 15, label: "3:00 PM UTC" },
  { description: "US West afternoon", hour: 16, label: "4:00 PM UTC" },
  { description: "US West end of day", hour: 17, label: "5:00 PM UTC" },
  { description: "US evening", hour: 18, label: "6:00 PM UTC" },
  { description: "US late evening", hour: 19, label: "7:00 PM UTC" },
  { description: "Americas night", hour: 20, label: "8:00 PM UTC" },
  { description: "Pacific evening", hour: 21, label: "9:00 PM UTC" },
  { description: "Asia-Pacific early", hour: 22, label: "10:00 PM UTC" },
  { description: "Asia-Pacific pre-dawn", hour: 23, label: "11:00 PM UTC" },
];

/** The fixed UTC hour the daily Vercel cron fires. */
export const CRON_DAILY_HOUR = 9;

export const DEFAULT_PREFERRED_HOUR = CRON_DAILY_HOUR;

export function isValidCronSlotHour(hour: number): boolean {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23;
}

export const PREFERRED_HOUR_SELECT_OPTIONS = CRON_SLOTS.map((slot) => ({
  badge: slot.hour !== CRON_DAILY_HOUR ? "Coming soon" : undefined,
  disabled: slot.hour !== CRON_DAILY_HOUR,
  label: `${slot.label} \u2013 ${slot.description}`,
  value: String(slot.hour),
}));

// ---------------------------------------------------------------------------
// Day-of-week options (for weekly cadence)
// ---------------------------------------------------------------------------

export const DEFAULT_PREFERRED_DAY = 1; // Monday

export const DAY_OF_WEEK_OPTIONS = [
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
  { label: "Sunday", value: "0" },
] as const;

export function isValidDayOfWeek(day: number): boolean {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}
