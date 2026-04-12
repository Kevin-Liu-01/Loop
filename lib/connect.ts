import { clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

function getStripeClient(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeInstance;
}

export async function createConnectAccount(
  clerkUserId: string,
  email: string
): Promise<Stripe.Account> {
  const stripe = getStripeClient();

  const account = await stripe.accounts.create({
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    email,
    metadata: { clerkUserId },
    type: "express",
  });

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { stripeConnectAccountId: account.id },
  });

  return account;
}

export async function createOnboardingLink(
  accountId: string,
  origin: string
): Promise<string> {
  const stripe = getStripeClient();

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/settings/connect?connect=refresh`,
    return_url: `${origin}/settings/connect?connect=complete`,
    type: "account_onboarding",
  });

  return link.url;
}

export async function getConnectAccountStatus(accountId: string): Promise<{
  ready: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
}> {
  const stripe = getStripeClient();
  const account = await stripe.accounts.retrieve(accountId);

  return {
    chargesEnabled: account.charges_enabled === true,
    detailsSubmitted: account.details_submitted === true,
    ready:
      account.charges_enabled === true && account.details_submitted === true,
  };
}

export async function createConnectLoginLink(
  accountId: string
): Promise<string> {
  const stripe = getStripeClient();
  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}
