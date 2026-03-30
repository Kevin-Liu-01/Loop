import { getServerSupabase } from "@/lib/db/client";
import type { SkillPurchaseRecord } from "@/lib/types";

export async function recordPurchase(record: SkillPurchaseRecord): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("purchases").upsert(
    {
      id: record.id,
      clerk_user_id: record.clerkUserId,
      skill_slug: record.skillSlug,
      stripe_payment_intent_id: record.stripePaymentIntentId,
      amount: record.amount,
      currency: record.currency,
      purchased_at: record.purchasedAt
    } as never,
    { onConflict: "id" }
  );

  if (error) throw new Error(`recordPurchase failed: ${error.message}`);
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

  if (error) throw new Error(`hasUserPurchasedSkill failed: ${error.message}`);
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

  if (error) throw new Error(`getUserPurchases failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    clerkUserId: row.clerk_user_id,
    skillSlug: row.skill_slug,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    amount: row.amount,
    currency: row.currency,
    purchasedAt: row.purchased_at
  }));
}
