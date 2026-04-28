import type { StripeSubscriptionRecord } from "@/lib/types";

export type BillingPortalCustomerResolution =
  | { customerId: string; ok: true }
  | { ok: false; reason: "customer-mismatch" | "no-customer" };

export function resolveBillingPortalCustomer(
  subscription: StripeSubscriptionRecord | null,
  requestedCustomerId: string | null
): BillingPortalCustomerResolution {
  if (!subscription?.customerId) {
    return { ok: false, reason: "no-customer" };
  }

  if (requestedCustomerId && requestedCustomerId !== subscription.customerId) {
    return { ok: false, reason: "customer-mismatch" };
  }

  return { customerId: subscription.customerId, ok: true };
}
