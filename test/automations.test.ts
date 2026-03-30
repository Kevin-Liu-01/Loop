import assert from "node:assert/strict";
import test from "node:test";

import {
  cadenceToRRule,
  cadenceValueToSkillCadence,
  rruleToCadence,
  skillCadenceToCadenceValue,
  skillCadenceToRRule
} from "@/lib/automation-constants";
import { formatAutomationSchedule } from "@/lib/format";
import { isRRuleScheduledOnDate } from "@/lib/schedule";

// ---------------------------------------------------------------------------
// Cadence mapping roundtrips
// ---------------------------------------------------------------------------

test("cadenceToRRule returns a valid RRULE for each cadence value", () => {
  assert.match(cadenceToRRule("daily-9"), /FREQ=WEEKLY.*BYHOUR=9/);
  assert.match(cadenceToRRule("weekdays-9"), /BYDAY=MO,TU,WE,TH,FR/);
  assert.match(cadenceToRRule("weekly-mon"), /BYDAY=MO/);
  assert.match(cadenceToRRule("hourly-6"), /INTERVAL=6/);
});

test("rruleToCadence inverts cadenceToRRule for all known values", () => {
  assert.equal(rruleToCadence(cadenceToRRule("daily-9")), "daily-9");
  assert.equal(rruleToCadence(cadenceToRRule("weekdays-9")), "weekdays-9");
  assert.equal(rruleToCadence(cadenceToRRule("weekly-mon")), "weekly-mon");
  assert.equal(rruleToCadence(cadenceToRRule("hourly-6")), "hourly-6");
});

test("rruleToCadence defaults to daily-9 for unknown RRULE", () => {
  assert.equal(rruleToCadence("FREQ=MONTHLY;BYMONTHDAY=1"), "daily-9");
});

// ---------------------------------------------------------------------------
// Skill cadence ↔ CadenceValue conversions
// ---------------------------------------------------------------------------

test("skillCadenceToRRule maps UserSkillCadence to RRULE strings", () => {
  assert.match(skillCadenceToRRule("daily"), /FREQ=WEEKLY.*BYDAY=SU,MO/);
  assert.match(skillCadenceToRRule("weekly"), /BYDAY=MO.*BYHOUR=9/);
  assert.equal(skillCadenceToRRule("manual"), "");
});

test("skillCadenceToCadenceValue maps UserSkillCadence to CadenceValue", () => {
  assert.equal(skillCadenceToCadenceValue("daily"), "daily-9");
  assert.equal(skillCadenceToCadenceValue("weekly"), "weekly-mon");
  assert.equal(skillCadenceToCadenceValue("manual"), "daily-9");
});

test("cadenceValueToSkillCadence maps CadenceValue to UserSkillCadence", () => {
  assert.equal(cadenceValueToSkillCadence("daily-9"), "daily");
  assert.equal(cadenceValueToSkillCadence("weekdays-9"), "daily");
  assert.equal(cadenceValueToSkillCadence("hourly-6"), "daily");
  assert.equal(cadenceValueToSkillCadence("weekly-mon"), "weekly");
});

// ---------------------------------------------------------------------------
// Schedule formatting
// ---------------------------------------------------------------------------

test("formatAutomationSchedule turns known rules into human labels", () => {
  assert.equal(formatAutomationSchedule("FREQ=HOURLY;INTERVAL=6"), "Every 6 hours");
  assert.equal(formatAutomationSchedule("FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0"), "Monday · 9:00 AM");
  assert.equal(
    formatAutomationSchedule("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=9;BYMINUTE=0"),
    "Daily · 9:00 AM"
  );
  assert.equal(
    formatAutomationSchedule("FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA;BYHOUR=9;BYMINUTE=0"),
    "Daily · 9:00 AM"
  );
  assert.equal(
    formatAutomationSchedule("RRULE:FREQ=WEEKLY;BYHOUR=9;BYMINUTE=0;BYDAY=SU,MO,TU,WE,TH,FR,SA"),
    "Daily · 9:00 AM"
  );
  assert.equal(
    formatAutomationSchedule("FREQ=WEEKLY;BYDAY=SA,SU;BYHOUR=8;BYMINUTE=30"),
    "Weekends · 8:30 AM"
  );
  assert.equal(
    formatAutomationSchedule("FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=14;BYMINUTE=0"),
    "Mon, Wed, Fri · 2:00 PM"
  );
});

// ---------------------------------------------------------------------------
// Calendar scheduling
// ---------------------------------------------------------------------------

test("isRRuleScheduledOnDate matches projected runs for a calendar day", () => {
  const monday = new Date(2026, 2, 9);
  assert.equal(isRRuleScheduledOnDate("FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0", monday), true);
  const tuesday = new Date(2026, 2, 10);
  assert.equal(isRRuleScheduledOnDate("FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0", tuesday), false);
});

// ---------------------------------------------------------------------------
// Seed data validation
// ---------------------------------------------------------------------------

test("all skill source configs have at least 4 sources", async () => {
  const { SKILL_SOURCE_CONFIGS } = await import("@/lib/db/seed-data/skill-sources");

  const underSourced = SKILL_SOURCE_CONFIGS.filter((cfg) => cfg.sources.length < 4);
  assert.equal(
    underSourced.length,
    0,
    `Skills with fewer than 4 sources: ${underSourced.map((c) => `${c.slug} (${c.sources.length})`).join(", ")}`
  );
});

test("all skill source configs have non-empty actionable prompts", async () => {
  const { SKILL_SOURCE_CONFIGS } = await import("@/lib/db/seed-data/skill-sources");

  const generic = SKILL_SOURCE_CONFIGS.filter(
    (cfg) => cfg.automation.prompt.length < 50 || /^Refresh \w+ skill\.$/.test(cfg.automation.prompt)
  );
  assert.equal(
    generic.length,
    0,
    `Skills with generic prompts: ${generic.map((c) => c.slug).join(", ")}`
  );
});
