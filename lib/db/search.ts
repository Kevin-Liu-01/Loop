import { getServerSupabase } from "@/lib/db/client";
import type { CategorySlug, SearchHit, SkillOrigin } from "@/lib/types";

interface SearchOptions {
  category?: string;
  origin?: SkillOrigin;
  limit?: number;
}

interface SkillSearchRow {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  updated_at: string;
  origin: string;
  version: number;
}

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
      .select(
        "slug, title, description, category, tags, updated_at, origin, version"
      )
      .eq("visibility", "public")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (options.category) {
      q = q.eq("category", options.category);
    }
    if (options.origin) {
      q = q.eq("origin", options.origin);
    }

    const { data, error } = await q;
    if (error) {
      throw new Error(`searchSkills failed: ${error.message}`);
    }

    return ((data ?? []) as SkillSearchRow[]).map((row, index) => ({
      category: row.category as CategorySlug,
      description: row.description,
      href: `/skills/${row.slug}/v${row.version}`,
      id: `skill:${row.slug}:${row.version}`,
      kind: "skill" as const,
      origin: row.origin as SkillOrigin,
      score: limit - index,
      tags: row.tags,
      title: row.title,
      updatedAt: row.updated_at,
      versionLabel: `v${row.version}`,
    }));
  }

  const tsQuery = normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word}:*`)
    .join(" & ");

  const rpcQuery = db.rpc(
    "search_skills_fts" as never,
    {
      result_limit: limit,
      search_query: tsQuery,
    } as never
  );

  const { data, error } = await rpcQuery;

  if (error) {
    let fallback = db
      .from("skills")
      .select(
        "slug, title, description, category, tags, updated_at, origin, version"
      )
      .eq("visibility", "public")
      .or(
        `title.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%`
      )
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (options.category) {
      fallback = fallback.eq("category", options.category);
    }
    if (options.origin) {
      fallback = fallback.eq("origin", options.origin);
    }

    const { data: fallbackData, error: fallbackError } = await fallback;
    if (fallbackError) {
      throw new Error(`searchSkills fallback failed: ${fallbackError.message}`);
    }

    return ((fallbackData ?? []) as SkillSearchRow[]).map((row, index) => ({
      category: row.category as CategorySlug,
      description: row.description,
      href: `/skills/${row.slug}/v${row.version}`,
      id: `skill:${row.slug}:${row.version}`,
      kind: "skill" as const,
      origin: row.origin as SkillOrigin,
      score: limit - index,
      tags: row.tags,
      title: row.title,
      updatedAt: row.updated_at,
      versionLabel: `v${row.version}`,
    }));
  }

  type RpcRow = SkillSearchRow & { rank: number };
  return ((data ?? []) as unknown as RpcRow[]).map((row) => ({
    category: row.category as CategorySlug,
    description: row.description,
    href: `/skills/${row.slug}/v${row.version}`,
    id: `skill:${row.slug}:${row.version}`,
    kind: "skill" as const,
    origin: row.origin as SkillOrigin,
    score: row.rank,
    tags: row.tags,
    title: row.title,
    updatedAt: row.updated_at,
    versionLabel: `v${row.version}`,
  }));
}
