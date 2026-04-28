import type { StripeSubscriptionRecord } from "@/lib/types";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

function updatedAtMillis(subscription: StripeSubscriptionRecord): number {
  const parsed = Date.parse(subscription.updatedAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function compareNewestFirst(
  a: StripeSubscriptionRecord,
  b: StripeSubscriptionRecord
): number {
  return updatedAtMillis(b) - updatedAtMillis(a);
}

function isActiveSubscriptionStatus(status: string): boolean {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status);
}

export function getLatestSubscriptionForUser(
  subscriptions: StripeSubscriptionRecord[],
  clerkUserId: string
): StripeSubscriptionRecord | null {
  return (
    subscriptions
      .filter((subscription) => subscription.clerkUserId === clerkUserId)
      .toSorted(compareNewestFirst)[0] ?? null
  );
}

export function getActiveSubscriptionForUser(
  subscriptions: StripeSubscriptionRecord[],
  clerkUserId: string
): StripeSubscriptionRecord | null {
  return (
    subscriptions
      .filter(
        (subscription) =>
          subscription.clerkUserId === clerkUserId &&
          isActiveSubscriptionStatus(subscription.status)
      )
      .toSorted(compareNewestFirst)[0] ?? null
  );
}
