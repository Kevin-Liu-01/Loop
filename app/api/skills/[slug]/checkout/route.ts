import Stripe from "stripe";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import { hasUserPurchasedSkill } from "@/lib/purchases";
import { getSkillRecordBySlug } from "@/lib/content";
import { withApiUsage } from "@/lib/usage-server";

const DEFAULT_PLATFORM_FEE_PERCENT = 15;

function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getPlatformFeePercent(): number {
  const raw = process.env.STRIPE_CONNECT_PLATFORM_FEE_PERCENT;
  if (raw) {
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
  }
  return DEFAULT_PLATFORM_FEE_PERCENT;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withApiUsage(
    {
      route: "/api/skills/[slug]/checkout",
      method: "POST",
      label: "Skill purchase checkout"
    },
    async () => {
      try {
        const session = await requireAuth();
        const { slug } = await params;
        const { origin } = new URL(request.url);

        const skill = await getSkillRecordBySlug(slug);
        if (!skill) {
          return Response.json({ error: "Skill not found." }, { status: 404 });
        }

        if (!skill.price || skill.price.amount <= 0) {
          return Response.json({ error: "This skill is free." }, { status: 400 });
        }

        if (!skill.creatorClerkUserId) {
          return Response.json({ error: "This skill has no creator account linked." }, { status: 400 });
        }

        const alreadyPurchased = await hasUserPurchasedSkill(session.userId, slug);
        if (alreadyPurchased) {
          return Response.json({ error: "You already own this skill." }, { status: 400 });
        }

        const stripe = getStripeClient();
        const feePercent = getPlatformFeePercent();
        const applicationFee = Math.round(skill.price.amount * (feePercent / 100));

        const { listUserSkillDocuments } = await import("@/lib/user-skills");
        const userSkills = await listUserSkillDocuments();
        const creatorSkill = userSkills.find((s) => s.slug === slug);
        const connectAccountId = creatorSkill?.creatorClerkUserId
          ? await getCreatorConnectAccountId(creatorSkill.creatorClerkUserId)
          : null;

        if (!connectAccountId) {
          return Response.json({ error: "Creator has not connected their Stripe account." }, { status: 400 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: skill.price.currency,
                unit_amount: skill.price.amount,
                product_data: {
                  name: skill.title,
                  description: skill.description.slice(0, 200)
                }
              },
              quantity: 1
            }
          ],
          payment_intent_data: {
            application_fee_amount: applicationFee,
            transfer_data: { destination: connectAccountId }
          },
          metadata: {
            product: "loop",
            type: "skill_purchase",
            clerkUserId: session.userId,
            skillSlug: slug
          },
          success_url: `${origin}/skills/${slug}?purchased=true`,
          cancel_url: `${origin}/skills/${slug}`
        });

        if (!checkoutSession.url) {
          return Response.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
        }

        return Response.json({ ok: true, url: checkoutSession.url });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) return authResp;

        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ error: "Unable to start checkout." }, { status: 400 });
      }
    }
  );
}

async function getCreatorConnectAccountId(clerkUserId: string): Promise<string | null> {
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    return (user.publicMetadata as Record<string, unknown>)?.stripeConnectAccountId as string ?? null;
  } catch {
    return null;
  }
}
