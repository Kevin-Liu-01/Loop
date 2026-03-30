import assert from "node:assert/strict";
import test from "node:test";

import {
  createUserSkillDocument,
  isUserSkillAutomationDue
} from "@/lib/user-skills";
import type { UserSkillDocument } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeActiveSkill(overrides: {
  cadence?: "daily" | "weekly" | "manual";
  lastRunAt?: string | undefined;
  consecutiveFailures?: number;
  sourceUrls?: string[];
}): UserSkillDocument {
  const skill = createUserSkillDocument({
    title: "Test Skill",
    description: "A test skill for scheduling.",
    category: "infra",
    body: "## Purpose\n\nTest automation scheduling logic.\n\n## Workflow\n\n1. Read the latest sources.\n2. Pull concrete changes only.\n3. Turn the changes into reusable guidance.\n",
    tags: [],
    sourceUrls: overrides.sourceUrls ?? ["https://example.com/feed.xml"],
    autoUpdate: true,
    automationCadence: overrides.cadence ?? "daily",
    automationPrompt: "Refresh test."
  });

  return {
    ...skill,
    automation: {
      ...skill.automation,
      lastRunAt: overrides.lastRunAt,
      consecutiveFailures: overrides.consecutiveFailures ?? 0
    }
  };
}

// ---------------------------------------------------------------------------
// Eligibility: enabled, status, sources
// ---------------------------------------------------------------------------

test("disabled automation is never due", () => {
  const skill = makeActiveSkill({});
  const disabled = {
    ...skill,
    automation: { ...skill.automation, enabled: false }
  };
  assert.equal(isUserSkillAutomationDue(disabled, new Date("2026-03-30T12:00:00Z")), false);
});

test("paused automation is never due", () => {
  const skill = makeActiveSkill({});
  const paused = {
    ...skill,
    automation: { ...skill.automation, status: "paused" as const }
  };
  assert.equal(isUserSkillAutomationDue(paused, new Date("2026-03-30T12:00:00Z")), false);
});

test("skill with no sources is never due", () => {
  const skill = makeActiveSkill({ sourceUrls: [] });
  assert.equal(isUserSkillAutomationDue(skill, new Date("2026-03-30T12:00:00Z")), false);
});

test("manual cadence is never due", () => {
  const skill = makeActiveSkill({ cadence: "manual" });
  assert.equal(isUserSkillAutomationDue(skill, new Date("2026-03-30T12:00:00Z")), false);
});

// ---------------------------------------------------------------------------
// Daily cadence
// ---------------------------------------------------------------------------

test("daily skill with no lastRunAt is immediately due", () => {
  const skill = makeActiveSkill({ lastRunAt: undefined });
  assert.equal(isUserSkillAutomationDue(skill, new Date("2026-03-30T12:00:00Z")), true);
});

test("daily skill is due after 24 hours", () => {
  const skill = makeActiveSkill({ lastRunAt: "2026-03-29T12:00:00Z" });
  const after24h = new Date("2026-03-30T12:05:00Z");
  assert.equal(isUserSkillAutomationDue(skill, after24h), true);
});

test("daily skill is not due before 24 hours", () => {
  const skill = makeActiveSkill({ lastRunAt: "2026-03-30T00:00:00Z" });
  const before24h = new Date("2026-03-30T12:00:00Z");
  assert.equal(isUserSkillAutomationDue(skill, before24h), false);
});

// ---------------------------------------------------------------------------
// Weekly cadence + day-of-week gating
// ---------------------------------------------------------------------------

test("weekly skill fires on Monday UTC when overdue", () => {
  const skill = makeActiveSkill({ cadence: "weekly", lastRunAt: "2026-03-16T12:00:00Z" });
  const monday = new Date("2026-03-30T12:00:00Z");
  assert.equal(monday.getUTCDay(), 1, "sanity: Monday");
  assert.equal(isUserSkillAutomationDue(skill, monday), true);
});

test("weekly skill does not fire on non-Monday even if overdue", () => {
  const skill = makeActiveSkill({ cadence: "weekly", lastRunAt: "2026-03-16T12:00:00Z" });
  const wednesday = new Date("2026-04-01T12:00:00Z");
  assert.equal(wednesday.getUTCDay(), 3, "sanity: Wednesday");
  assert.equal(isUserSkillAutomationDue(skill, wednesday), false);
});

test("weekly skill does not fire on Monday if less than 7 days elapsed", () => {
  const skill = makeActiveSkill({ cadence: "weekly", lastRunAt: "2026-03-27T12:00:00Z" });
  const nextMonday = new Date("2026-03-30T12:00:00Z");
  assert.equal(nextMonday.getUTCDay(), 1, "sanity: Monday");
  assert.equal(isUserSkillAutomationDue(skill, nextMonday), false);
});

test("weekly skill with no lastRunAt fires on Monday", () => {
  const skill = makeActiveSkill({ cadence: "weekly", lastRunAt: undefined });
  const monday = new Date("2026-03-30T12:00:00Z");
  assert.equal(isUserSkillAutomationDue(skill, monday), true);
});

test("weekly skill with no lastRunAt does NOT fire on Tuesday", () => {
  const skill = makeActiveSkill({ cadence: "weekly", lastRunAt: undefined });
  const tuesday = new Date("2026-03-31T12:00:00Z");
  assert.equal(isUserSkillAutomationDue(skill, tuesday), false);
});

// ---------------------------------------------------------------------------
// Failure backoff
// ---------------------------------------------------------------------------

test("consecutiveFailures >= 3 prevents due check", () => {
  const skill = makeActiveSkill({ consecutiveFailures: 3, lastRunAt: undefined });
  assert.equal(isUserSkillAutomationDue(skill, new Date("2026-03-30T12:00:00Z")), false);
});

test("consecutiveFailures >= 3 prevents even weekly Monday", () => {
  const skill = makeActiveSkill({
    cadence: "weekly",
    consecutiveFailures: 5,
    lastRunAt: "2026-03-10T12:00:00Z"
  });
  const monday = new Date("2026-03-30T12:00:00Z");
  assert.equal(monday.getUTCDay(), 1);
  assert.equal(isUserSkillAutomationDue(skill, monday), false);
});

test("consecutiveFailures of 2 still allows due check", () => {
  const skill = makeActiveSkill({ consecutiveFailures: 2, lastRunAt: undefined });
  assert.equal(isUserSkillAutomationDue(skill, new Date("2026-03-30T12:00:00Z")), true);
});

test("consecutiveFailures of 0 or undefined behaves normally", () => {
  const skill0 = makeActiveSkill({ consecutiveFailures: 0, lastRunAt: undefined });
  assert.equal(isUserSkillAutomationDue(skill0, new Date("2026-03-30T12:00:00Z")), true);

  const skillUndef = makeActiveSkill({ lastRunAt: undefined });
  assert.equal(isUserSkillAutomationDue(skillUndef, new Date("2026-03-30T12:00:00Z")), true);
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

test("invalid lastRunAt date is treated as never run", () => {
  const skill = makeActiveSkill({});
  const withBadDate = {
    ...skill,
    automation: { ...skill.automation, lastRunAt: "not-a-date" }
  };
  assert.equal(isUserSkillAutomationDue(withBadDate, new Date("2026-03-30T12:00:00Z")), true);
});
