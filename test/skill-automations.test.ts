import assert from "node:assert/strict";
import test from "node:test";

import { buildSkillAutomationSummaries } from "@/lib/skill-automations";

test("buildSkillAutomationSummaries maps tracked skill automation to editable summaries", () => {
  const summaries = buildSkillAutomationSummaries({
    automation: {
      cadence: "daily",
      enabled: true,
      preferredHour: 9,
      prompt: "Refresh the skill from trusted sources.",
      status: "active",
    },
    automations: [],
    origin: "user",
    slug: "frontend-frontier",
    title: "Frontend Frontier",
  });

  assert.equal(summaries.length, 1);
  assert.equal(summaries[0]?.id, "frontend-frontier");
  assert.equal(summaries[0]?.schedule, "Daily · 9:00 AM");
  assert.equal(summaries[0]?.cadence, "daily");
  assert.equal(summaries[0]?.status, "ACTIVE");
});

test("buildSkillAutomationSummaries preserves paused/manual tracked automations", () => {
  const summaries = buildSkillAutomationSummaries({
    automation: {
      cadence: "manual",
      enabled: false,
      prompt: "Only refresh when asked.",
      status: "paused",
    },
    automations: [],
    origin: "user",
    slug: "security-best-practices",
    title: "Security Best Practices",
  });

  assert.equal(summaries[0]?.id, "security-best-practices");
  assert.equal(summaries[0]?.schedule, "Manual");
  assert.equal(summaries[0]?.cadence, "manual");
  assert.equal(summaries[0]?.status, "PAUSED");
});

test("buildSkillAutomationSummaries includes preferredDay for weekly", () => {
  const summaries = buildSkillAutomationSummaries({
    automation: {
      cadence: "weekly",
      enabled: true,
      preferredDay: 5,
      preferredHour: 14,
      prompt: "Run weekly review.",
      status: "active",
    },
    automations: [],
    origin: "user",
    slug: "weekly-review",
    title: "Weekly Review",
  });

  assert.equal(summaries[0]?.schedule, "Friday · 2:00 PM");
  assert.equal(summaries[0]?.cadence, "weekly");
  assert.equal(summaries[0]?.preferredDay, 5);
});
