import assert from "node:assert/strict";
import test from "node:test";

import type Stripe from "stripe";

import { resolveBillingPortalCustomer } from "@/lib/billing-portal";
import { toSubscriptionRecord } from "@/lib/stripe";
import {
  getActiveSubscriptionForUser,
  getLatestSubscriptionForUser,
} from "@/lib/subscriptions";
import type { StripeSubscriptionRecord } from "@/lib/types";

function subscription(
  overrides: Partial<StripeSubscriptionRecord>
): StripeSubscriptionRecord {
  return {
    cancelAtPeriodEnd: false,
    clerkUserId: "user_123",
    customerId: "cus_123",
    id: "sub_123",
    planSlug: "operator",
    status: "active",
    updatedAt: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

test("active subscription lookup ignores inactive billing states", () => {
  const records = [
    subscription({
      id: "sub_past_due",
      status: "past_due",
      updatedAt: "2026-04-03T00:00:00.000Z",
    }),
    subscription({
      id: "sub_active",
      status: "active",
      updatedAt: "2026-04-02T00:00:00.000Z",
    }),
  ];

  assert.equal(
    getActiveSubscriptionForUser(records, "user_123")?.id,
    "sub_active"
  );
});

test("latest subscription lookup returns the most recent billing record", () => {
  const records = [
    subscription({
      id: "sub_old_active",
      status: "active",
      updatedAt: "2026-04-01T00:00:00.000Z",
    }),
    subscription({
      id: "sub_latest_past_due",
      status: "past_due",
      updatedAt: "2026-04-05T00:00:00.000Z",
    }),
  ];

  assert.equal(
    getLatestSubscriptionForUser(records, "user_123")?.id,
    "sub_latest_past_due"
  );
});

test("subscription lookup returns null for unknown clerk user id", () => {
  const records = [subscription({ clerkUserId: "user_123" })];

  assert.equal(getActiveSubscriptionForUser(records, "user_unknown"), null);
  assert.equal(getLatestSubscriptionForUser(records, "user_unknown"), null);
});

test("billing portal only resolves the signed-in user's Stripe customer", () => {
  const record = subscription({ customerId: "cus_signed_in_user" });

  assert.deepEqual(resolveBillingPortalCustomer(record, null), {
    customerId: "cus_signed_in_user",
    ok: true,
  });
  assert.deepEqual(resolveBillingPortalCustomer(record, "cus_other_user"), {
    ok: false,
    reason: "customer-mismatch",
  });
});

test("toSubscriptionRecord uses Stripe subscription status directly", () => {
  const source = {
    cancel_at_period_end: false,
    customer: "cus_123",
    id: "sub_123",
    items: {
      data: [
        {
          current_period_end: 1_777_243_116,
          price: { nickname: "operator" },
        },
      ],
    },
    latest_invoice: "in_123",
    metadata: { clerkUserId: "user_123", plan: "operator" },
    status: "active",
  } as unknown as Stripe.Subscription;

  const record = toSubscriptionRecord(source, "2026-04-01T00:00:00.000Z");

  assert.equal(record?.status, "active");
  assert.equal(record?.customerId, "cus_123");
  assert.equal(record?.planSlug, "operator");
  assert.equal(record?.clerkUserId, "user_123");
});

test("toSubscriptionRecord returns null when customer is not a string", () => {
  const source = {
    cancel_at_period_end: false,
    customer: { id: "cus_expanded" },
    id: "sub_123",
    items: { data: [] },
    metadata: {},
    status: "active",
  } as unknown as Stripe.Subscription;

  assert.equal(toSubscriptionRecord(source, "2026-04-01T00:00:00.000Z"), null);
});
