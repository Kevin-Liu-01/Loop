import Stripe from "stripe";

import { toBillingEventRecord, toSubscriptionRecord } from "@/lib/stripe";
import { recordBillingEvent, upsertSubscription } from "@/lib/system-state";

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  return new Stripe(key);
}

/**
 * After a successful Stripe Checkout redirect, fetch the session and
 * its subscription directly from Stripe and upsert the records into
 * the database. This ensures local dev works without the webhook
 * and acts as a reliable fallback in production if a webhook is delayed.
 */
export async function reconcileCheckoutSession(
  sessionId: string
): Promise<void> {
  const stripe = getStripeClient();
  if (!stripe) {
    return;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (session.payment_status !== "paid") {
    return;
  }

  const now = new Date().toISOString();

  try {
    const billingEvent = toBillingEventRecord({
      created: Math.floor(Date.now() / 1000),
      data: { object: session },
      id: `reconcile_${sessionId}`,
      livemode: session.livemode,
      type: "checkout.session.completed",
    } as unknown as Stripe.Event);
    await recordBillingEvent(billingEvent);
  } catch {
    // billing event may already exist from webhook -- ignore
  }

  const subscription = session.subscription as Stripe.Subscription | null;
  if (!subscription) {
    return;
  }

  const record = toSubscriptionRecord(subscription, now);
  if (record) {
    await upsertSubscription(record);
  }
}
