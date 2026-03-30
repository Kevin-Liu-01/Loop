import { z } from "zod";
import type { UserSkillCadence } from "@/lib/types";

export const CADENCE_OPTIONS = [
  { value: "daily-9", label: "Daily · 9:00 AM" },
  { value: "weekdays-9", label: "Weekdays · 9:00 AM" },
  { value: "weekly-mon", label: "Monday · 9:00 AM" },
  { value: "hourly-6", label: "Every 6 hours" }
] as const;

export type CadenceValue = (typeof CADENCE_OPTIONS)[number]["value"];

export const automationCadenceSchema = z.enum(["hourly-6", "daily-9", "weekdays-9", "weekly-mon"]);

const RRULE_TO_CADENCE: Record<string, CadenceValue> = {
  "FREQ=HOURLY;INTERVAL=6": "hourly-6",
  "FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA;BYHOUR=9;BYMINUTE=0": "daily-9",
  "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9;BYMINUTE=0": "weekdays-9",
  "FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0": "weekly-mon"
};

const CADENCE_TO_RRULE: Record<CadenceValue, string> = {
  "hourly-6": "FREQ=HOURLY;INTERVAL=6",
  "daily-9": "FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA;BYHOUR=9;BYMINUTE=0",
  "weekdays-9": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9;BYMINUTE=0",
  "weekly-mon": "FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0"
};

const SKILL_CADENCE_TO_RRULE: Record<UserSkillCadence, string> = {
  daily: "FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA;BYHOUR=9;BYMINUTE=0",
  weekly: "FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0",
  manual: ""
};

const SKILL_CADENCE_TO_CADENCE_VALUE: Record<UserSkillCadence, CadenceValue> = {
  daily: "daily-9",
  weekly: "weekly-mon",
  manual: "daily-9"
};

const CADENCE_VALUE_TO_SKILL_CADENCE: Record<CadenceValue, UserSkillCadence> = {
  "hourly-6": "daily",
  "daily-9": "daily",
  "weekdays-9": "daily",
  "weekly-mon": "weekly"
};

export function rruleToCadence(rrule: string): CadenceValue {
  return RRULE_TO_CADENCE[rrule] ?? "daily-9";
}

export function cadenceToRRule(cadence: CadenceValue): string {
  return CADENCE_TO_RRULE[cadence];
}

export function skillCadenceToRRule(cadence: UserSkillCadence): string {
  return SKILL_CADENCE_TO_RRULE[cadence] ?? "";
}

export function skillCadenceToCadenceValue(cadence: UserSkillCadence): CadenceValue {
  return SKILL_CADENCE_TO_CADENCE_VALUE[cadence] ?? "daily-9";
}

export function cadenceValueToSkillCadence(cadence: CadenceValue): UserSkillCadence {
  return CADENCE_VALUE_TO_SKILL_CADENCE[cadence] ?? "daily";
}
