import { getServerSupabase } from "@/lib/db/client";
import type { CategoryBrief, CategorySlug, DailySignal } from "@/lib/types";

type BriefRow = {
  id: string;
  category_slug: string;
  title: string;
  summary: string;
  what_changed: string;
  experiments: string[];
  items: unknown;
  generated_at: string;
};

function rowToBrief(row: BriefRow): CategoryBrief {
  return {
    slug: row.category_slug as CategorySlug,
    title: row.title,
    summary: row.summary,
    whatChanged: row.what_changed,
    experiments: row.experiments,
    items: (row.items ?? []) as DailySignal[],
    generatedAt: row.generated_at
  };
}

export async function listBriefs(): Promise<CategoryBrief[]> {
  const db = getServerSupabase();

  const { data, error } = await db
    .from("daily_briefs")
    .select("*")
    .order("generated_at", { ascending: false });

  if (error) throw new Error(`listBriefs failed: ${error.message}`);

  const latestByCategory = new Map<string, BriefRow>();
  for (const row of data as BriefRow[]) {
    if (!latestByCategory.has(row.category_slug)) {
      latestByCategory.set(row.category_slug, row);
    }
  }

  return Array.from(latestByCategory.values()).map(rowToBrief);
}

export async function getBriefByCategory(slug: CategorySlug): Promise<CategoryBrief | null> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("daily_briefs")
    .select("*")
    .eq("category_slug", slug)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getBriefByCategory failed: ${error.message}`);
  return data ? rowToBrief(data as BriefRow) : null;
}

export async function upsertBrief(brief: CategoryBrief): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("daily_briefs").insert({
    category_slug: brief.slug,
    title: brief.title,
    summary: brief.summary,
    what_changed: brief.whatChanged,
    experiments: brief.experiments,
    items: brief.items,
    generated_at: brief.generatedAt
  });

  if (error) throw new Error(`upsertBrief failed: ${error.message}`);
}
