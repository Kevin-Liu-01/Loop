import assert from "node:assert/strict";
import test from "node:test";

import { buildPausedAutomationFromSource } from "@/lib/skill-fork-helpers";

test("buildPausedAutomationFromSource preserves active state from source", () => {
  const result = buildPausedAutomationFromSource({
    automation: {
      cadence: "weekly",
      consecutiveFailures: 2,
      enabled: true,
      lastRunAt: "2026-03-30T12:00:00Z",
      preferredModel: "gpt-4o",
      prompt: "Watch for new patterns in the React ecosystem.",
      status: "active",
    },
    slug: "react-patterns",
    title: "React Patterns",
  });

  assert.equal(result.enabled, true);
  assert.equal(result.status, "active");
  assert.equal(result.cadence, "weekly");
  assert.equal(result.prompt, "Watch for new patterns in the React ecosystem.");
  assert.equal(result.preferredModel, "gpt-4o");
  assert.equal(result.lastRunAt, undefined);
  assert.equal(result.consecutiveFailures, undefined);
});

test("buildPausedAutomationFromSource keeps paused state from paused source", () => {
  const result = buildPausedAutomationFromSource({
    automation: {
      cadence: "daily",
      enabled: false,
      prompt: "Check for updates.",
      status: "paused",
    },
    slug: "paused-skill",
    title: "Paused Skill",
  });

  assert.equal(result.enabled, false);
  assert.equal(result.status, "paused");
  assert.equal(result.cadence, "daily");
});

test("buildPausedAutomationFromSource creates default paused automation when source has none", () => {
  const result = buildPausedAutomationFromSource({
    automation: undefined,
    slug: "my-custom-skill",
    title: "My Custom Skill",
  });

  assert.equal(result.enabled, false);
  assert.equal(result.status, "paused");
  assert.equal(result.cadence, "daily");
  assert.ok(result.prompt.includes("$my-custom-skill"));
  assert.equal(result.lastRunAt, undefined);
  assert.equal(result.preferredModel, undefined);
});
