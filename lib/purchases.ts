import { getServerSupabase } from "@/lib/db/client";
import type { SkillPurchaseRecord } from "@/lib/types";

export async function recordPurchase(
  record: SkillPurchaseRecord
): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("purchases").upsert(
    {
      amount: record.amount,
      clerk_user_id: record.clerkUserId,
      currency: record.currency,
      id: record.id,
      purchased_at: record.purchasedAt,
      skill_slug: record.skillSlug,
      stripe_payment_intent_id: record.stripePaymentIntentId,
    } as never,
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(`recordPurchase failed: ${error.message}`);
  }
}

export async function hasUserPurchasedSkill(
  clerkUserId: string,
  skillSlug: string
): Promise<boolean> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("purchases")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .eq("skill_slug", skillSlug)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`hasUserPurchasedSkill failed: ${error.message}`);
  }
  return data !== null;
}

export async function getUserPurchases(
  clerkUserId: string
): Promise<SkillPurchaseRecord[]> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("purchases")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .order("purchased_at", { ascending: false });

  if (error) {
    throw new Error(`getUserPurchases failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    amount: row.amount,
    clerkUserId: row.clerk_user_id,
    currency: row.currency,
    id: row.id,
    purchasedAt: row.purchased_at,
    skillSlug: row.skill_slug,
    stripePaymentIntentId: row.stripe_payment_intent_id,
  }));
}
