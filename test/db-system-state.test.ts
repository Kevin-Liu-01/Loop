import assert from "node:assert/strict";
import test from "node:test";

import type {
  LoopRunRecord,
  RefreshRunRecord,
  UsageEventRecord,
  BillingEventRecord,
  StripeSubscriptionRecord,
} from "@/lib/types";

test("LoopRunRecord type satisfies required shape for DB mapping", () => {
  const record: LoopRunRecord = {
    bodyChanged: true,
    changedSections: ["Purpose"],
    diffLines: [{ type: "added", value: "+ New line" }],
    editorModel: "gpt-4.1-mini",
    finishedAt: "2026-03-28T00:01:00.000Z",
    href: "/skills/test-skill/v2",
    id: "test-loop-run-001",
    messages: ["Started scanning.", "Completed."],
    nextVersionLabel: "v2",
    origin: "user",
    previousVersionLabel: "v1",
    signalCount: 5,
    slug: "test-skill",
    sourceCount: 2,
    sources: [],
    startedAt: "2026-03-28T00:00:00.000Z",
    status: "success",
    summary: "Test loop run completed.",
    title: "Test Skill",
    trigger: "manual",
    whatChanged: "Updated section headers.",
  };

  assert.equal(record.id, "test-loop-run-001");
  assert.equal(record.status, "success");
  assert.equal(record.trigger, "manual");
  assert.equal(record.bodyChanged, true);
  assert.deepEqual(record.changedSections, ["Purpose"]);
});

test("RefreshRunRecord type satisfies DB mapping shape", () => {
  const record: RefreshRunRecord = {
    categoryCount: 7,
    dailyBriefCount: 7,
    finishedAt: "2026-03-28T00:10:00.000Z",
    focusImportedSkillSlugs: [],
    focusSkillSlugs: [],
    generatedAt: "2026-03-28T00:09:00.000Z",
    generatedFrom: "remote-refresh",
    id: "test-refresh-001",
    refreshCategorySignals: true,
    refreshImportedSkills: true,
    refreshUserSkills: true,
    skillCount: 42,
    startedAt: "2026-03-28T00:00:00.000Z",
    status: "success",
    uploadBlob: false,
    writeLocal: false,
  };

  assert.equal(record.status, "success");
  assert.equal(record.skillCount, 42);
  assert.equal(record.writeLocal, false);
});

test("UsageEventRecord type satisfies DB mapping shape", () => {
  const record: UsageEventRecord = {
    at: "2026-03-28T00:00:00.000Z",
    durationMs: 150,
    id: "test-usage-001",
    kind: "api_call",
    label: "Test API call",
    method: "GET",
    ok: true,
    route: "/api/skills",
    source: "api",
    status: 200,
  };

  assert.equal(record.kind, "api_call");
  assert.equal(record.status, 200);
  assert.equal(record.durationMs, 150);
});

test("BillingEventRecord type satisfies DB mapping shape", () => {
  const record: BillingEventRecord = {
    amount: 2900,
    createdAt: "2026-03-28T00:00:00.000Z",
    currency: "usd",
    customerEmail: "test@example.com",
    customerId: "cus_test123",
    id: "test-billing-001",
    livemode: false,
    planSlug: "pro",
    status: "active",
    subscriptionId: "sub_test123",
    type: "checkout.session.completed",
  };

  assert.equal(record.type, "checkout.session.completed");
  assert.equal(record.amount, 2900);
});

test("StripeSubscriptionRecord type satisfies DB mapping shape", () => {
  const record: StripeSubscriptionRecord = {
    cancelAtPeriodEnd: false,
    currentPeriodEnd: "2026-04-28T00:00:00.000Z",
    customerEmail: "test@example.com",
    customerId: "cus_test123",
    id: "sub_test123",
    planSlug: "pro",
    status: "active",
    updatedAt: "2026-03-28T00:00:00.000Z",
  };

  assert.equal(record.status, "active");
  assert.equal(record.cancelAtPeriodEnd, false);
});
