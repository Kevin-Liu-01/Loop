import { getServerSupabase } from "@/lib/db/client";
import type { CategorySlug, SkillUpstreamRecord } from "@/lib/types";

interface SkillUpstreamRow {
  slug: string;
  title: string;
  description: string;
  category: string;
  upstream_url: string;
  upstream_kind: string;
  source_id: string;
  logo_url: string | null;
  tags: string[];
  body: string;
}

export async function listSkillUpstreams(
  skillSlug: string
): Promise<SkillUpstreamRecord[]> {
  const db = getServerSupabase();
  const { data: links, error: linkError } = await db
    .from("skill_upstream_links")
    .select("upstream_slug")
    .eq("skill_slug", skillSlug);

  if (linkError) {
    if (linkError.code === "PGRST205") {
      return [];
    }
    throw linkError;
  }

  const upstreamSlugs = [
    ...new Set(
      (links ?? []).map((row: { upstream_slug: string }) => row.upstream_slug)
    ),
  ];

  if (upstreamSlugs.length === 0) {
    return [];
  }

  const { data, error } = await db
    .from("skill_upstreams")
    .select("*")
    .in("slug", upstreamSlugs);

  if (error) {
    if (error.code === "PGRST205") {
      return [];
    }
    throw error;
  }

  return ((data ?? []) as SkillUpstreamRow[])
    .map((row) => ({
      body: row.body,
      category: row.category as CategorySlug,
      description: row.description,
      logoUrl: row.logo_url ?? undefined,
      slug: row.slug,
      sourceId: row.source_id,
      tags: row.tags ?? [],
      title: row.title,
      upstreamKind: row.upstream_kind as SkillUpstreamRecord["upstreamKind"],
      upstreamUrl: row.upstream_url,
    }))
    .toSorted((left, right) => left.title.localeCompare(right.title));
}
