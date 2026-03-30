import { getServerSupabase } from "@/lib/db/client";
import type { CategorySlug, SearchHit, SkillOrigin } from "@/lib/types";

type SearchOptions = {
  category?: string;
  origin?: SkillOrigin;
  limit?: number;
};

type SkillSearchRow = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  updated_at: string;
  origin: string;
  version: number;
};

export async function searchSkills(
  query: string,
  options: SearchOptions = {}
): Promise<SearchHit[]> {
  const db = getServerSupabase();
  const limit = options.limit ?? 12;
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    let q = db
      .from("skills")
      .select("slug, title, description, category, tags, updated_at, origin, version")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (options.category) q = q.eq("category", options.category);
    if (options.origin) q = q.eq("origin", options.origin);

    const { data, error } = await q;
    if (error) throw new Error(`searchSkills failed: ${error.message}`);

    return ((data ?? []) as SkillSearchRow[]).map((row, index) => ({
      id: `skill:${row.slug}:${row.version}`,
      kind: "skill" as const,
      title: row.title,
      description: row.description,
      href: `/skills/${row.slug}/v${row.version}`,
      category: row.category as CategorySlug,
      tags: row.tags,
      updatedAt: row.updated_at,
      origin: row.origin as SkillOrigin,
      versionLabel: `v${row.version}`,
      score: limit - index
    }));
  }

  const tsQuery = normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word}:*`)
    .join(" & ");

  let rpcQuery = db.rpc("search_skills_fts" as never, {
    search_query: tsQuery,
    result_limit: limit
  } as never);

  const { data, error } = await rpcQuery;

  if (error) {
    let fallback = db
      .from("skills")
      .select("slug, title, description, category, tags, updated_at, origin, version")
      .or(`title.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%`)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (options.category) fallback = fallback.eq("category", options.category);
    if (options.origin) fallback = fallback.eq("origin", options.origin);

    const { data: fallbackData, error: fallbackError } = await fallback;
    if (fallbackError) throw new Error(`searchSkills fallback failed: ${fallbackError.message}`);

    return ((fallbackData ?? []) as SkillSearchRow[]).map((row, index) => ({
      id: `skill:${row.slug}:${row.version}`,
      kind: "skill" as const,
      title: row.title,
      description: row.description,
      href: `/skills/${row.slug}/v${row.version}`,
      category: row.category as CategorySlug,
      tags: row.tags,
      updatedAt: row.updated_at,
      origin: row.origin as SkillOrigin,
      versionLabel: `v${row.version}`,
      score: limit - index
    }));
  }

  type RpcRow = SkillSearchRow & { rank: number };
  return (((data ?? []) as unknown) as RpcRow[]).map((row) => ({
    id: `skill:${row.slug}:${row.version}`,
    kind: "skill" as const,
    title: row.title,
    description: row.description,
    href: `/skills/${row.slug}/v${row.version}`,
    category: row.category as CategorySlug,
    tags: row.tags,
    updatedAt: row.updated_at,
    origin: row.origin as SkillOrigin,
    versionLabel: `v${row.version}`,
    score: row.rank
  }));
}
