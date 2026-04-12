import { auth, currentUser } from "@clerk/nextjs/server";

import { isAdminEmail } from "@/lib/admin";
import { listSubscriptions } from "@/lib/system-state";
import type { StripeSubscriptionRecord } from "@/lib/types";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export interface SessionUser {
  userId: string;
  email: string;
  stripeConnectAccountId: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  if (!user) {
    return null;
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const connectId = (user.publicMetadata as Record<string, unknown>)
    ?.stripeConnectAccountId as string | undefined;

  return {
    email,
    stripeConnectAccountId: connectId ?? null,
    userId,
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new AuthError("Sign in to continue.", 401);
  }
  return session;
}

export async function getUserSubscription(
  clerkUserId: string
): Promise<StripeSubscriptionRecord | null> {
  const subscriptions = await listSubscriptions();

  const byClerkId = subscriptions.find(
    (sub) =>
      sub.clerkUserId === clerkUserId &&
      ACTIVE_SUBSCRIPTION_STATUSES.has(sub.status)
  );
  if (byClerkId) {
    return byClerkId;
  }

  return null;
}

export async function requireActiveSubscription(): Promise<
  SessionUser & { subscription: StripeSubscriptionRecord }
> {
  const session = await requireAuth();
  const subscription = await getUserSubscription(session.userId);
  if (!subscription && !isAdminEmail(session.email)) {
    throw new AuthError("An active Operator subscription is required.", 403);
  }
  const fallback: StripeSubscriptionRecord = {
    cancelAtPeriodEnd: false,
    clerkUserId: session.userId,
    customerEmail: session.email,
    customerId: "admin-bypass",
    id: "admin-bypass",
    planSlug: "operator",
    status: "active",
    updatedAt: new Date().toISOString(),
  };
  return { ...session, subscription: subscription ?? fallback };
}

export async function requireConnectedAccount(): Promise<
  SessionUser & { stripeConnectAccountId: string }
> {
  const session = await requireAuth();
  if (!session.stripeConnectAccountId) {
    throw new AuthError("Connect your Stripe account to continue.", 403);
  }
  return { ...session, stripeConnectAccountId: session.stripeConnectAccountId };
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export function authErrorResponse(error: unknown): Response | null {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return null;
}
