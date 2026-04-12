import Stripe from "stripe";

import { MEMBERSHIP_PLANS } from "@/lib/registry";
import type { BillingEventRecord, StripeSubscriptionRecord } from "@/lib/types";

function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getPriceId(planSlug: string): string {
  const envKey = `STRIPE_PRICE_${planSlug.toUpperCase()}`;
  const priceId = process.env[envKey];
  if (!priceId) {
    throw new Error(`Missing ${envKey}.`);
  }

  return priceId;
}

export function getPaidPlans() {
  return MEMBERSHIP_PLANS.filter((plan) => plan.slug !== "free");
}

export function getStripeConfiguration() {
  return {
    configuredPlanPrices: getPaidPlans().map((plan) => ({
      configured: Boolean(
        process.env[`STRIPE_PRICE_${plan.slug.toUpperCase()}`]
      ),
      slug: plan.slug,
    })),
    hasSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    hasWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  };
}

export async function createCheckoutSession(
  planSlug: string,
  origin: string,
  clerkUserId: string
): Promise<string> {
  const stripe = getStripeClient();
  const priceId = getPriceId(planSlug);

  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    cancel_url: `${origin}/settings/subscription?checkout=canceled`,
    customer_creation: "always",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      clerkUserId,
      plan: planSlug,
      product: "loop",
    },
    mode: "subscription",
    subscription_data: {
      metadata: {
        clerkUserId,
        plan: planSlug,
        product: "loop",
      },
    },
    success_url: `${origin}/settings/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.url) {
    throw new Error("Stripe checkout session did not return a URL.");
  }

  return session.url;
}

export async function createPortalSession(
  customerId: string,
  origin: string
): Promise<string> {
  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/settings/subscription`,
  });

  return session.url;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): Stripe.Event {
  const stripe = getStripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export function toBillingEventRecord(event: Stripe.Event): BillingEventRecord {
  const createdAt = new Date(event.created * 1000).toISOString();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    return {
      amount:
        typeof session.amount_total === "number"
          ? session.amount_total
          : undefined,
      createdAt,
      currency: session.currency ?? undefined,
      customerEmail: session.customer_details?.email ?? undefined,
      customerId:
        typeof session.customer === "string" ? session.customer : undefined,
      id: event.id,
      livemode: event.livemode,
      planSlug: session.metadata?.plan ?? undefined,
      status: session.payment_status ?? undefined,
      subscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : undefined,
      type: event.type,
    };
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    return {
      createdAt,
      customerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : undefined,
      id: event.id,
      livemode: event.livemode,
      planSlug:
        subscription.metadata?.plan ??
        subscription.items.data[0]?.price.nickname ??
        undefined,
      status: subscription.status,
      subscriptionId: subscription.id,
      type: event.type,
    };
  }

  const invoice = event.data.object as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };
  return {
    amount:
      typeof invoice.amount_paid === "number" ? invoice.amount_paid : undefined,
    createdAt,
    currency: invoice.currency ?? undefined,
    customerEmail: invoice.customer_email ?? undefined,
    customerId:
      typeof invoice.customer === "string" ? invoice.customer : undefined,
    id: event.id,
    livemode: event.livemode,
    status: invoice.status ?? undefined,
    subscriptionId:
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : undefined,
    type: event.type,
  };
}

export function toSubscriptionRecord(
  source: Stripe.Subscription | Stripe.Checkout.Session,
  updatedAt: string
): StripeSubscriptionRecord | null {
  if ("object" in source && source.object === "checkout.session") {
    const customerId =
      typeof source.customer === "string" ? source.customer : undefined;
    const subscriptionId =
      typeof source.subscription === "string" ? source.subscription : undefined;
    if (!customerId || !subscriptionId) {
      return null;
    }

    return {
      cancelAtPeriodEnd: false,
      checkoutCompletedAt: updatedAt,
      clerkUserId: source.metadata?.clerkUserId ?? undefined,
      customerEmail: source.customer_details?.email ?? undefined,
      customerId,
      id: subscriptionId,
      planSlug: source.metadata?.plan ?? undefined,
      status: source.payment_status ?? "open",
      updatedAt,
    };
  }

  const customerId =
    typeof source.customer === "string" ? source.customer : undefined;
  if (!customerId) {
    return null;
  }

  return {
    cancelAtPeriodEnd: source.cancel_at_period_end,
    clerkUserId: source.metadata?.clerkUserId ?? undefined,
    currentPeriodEnd:
      typeof source.items.data[0]?.current_period_end === "number"
        ? new Date(source.items.data[0].current_period_end * 1000).toISOString()
        : undefined,
    customerId,
    id: source.id,
    latestInvoiceId:
      typeof source.latest_invoice === "string"
        ? source.latest_invoice
        : undefined,
    planSlug:
      source.metadata?.plan ??
      source.items.data[0]?.price.nickname ??
      undefined,
    status: source.status,
    updatedAt,
  };
}
