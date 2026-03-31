import { getServerSupabase } from "@/lib/db/client";
import type { CategorySlug, SkillUpstreamRecord } from "@/lib/types";

type SkillUpstreamRow = {
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
};

export async function listSkillUpstreams(skillSlug: string): Promise<SkillUpstreamRecord[]> {
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

  const upstreamSlugs = Array.from(
    new Set((links ?? []).map((row: { upstream_slug: string }) => row.upstream_slug)),
  );

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
      slug: row.slug,
      title: row.title,
      description: row.description,
      category: row.category as CategorySlug,
      upstreamUrl: row.upstream_url,
      upstreamKind: row.upstream_kind as SkillUpstreamRecord["upstreamKind"],
      sourceId: row.source_id,
      logoUrl: row.logo_url ?? undefined,
      tags: row.tags ?? [],
      body: row.body,
    }))
    .sort((left, right) => left.title.localeCompare(right.title));
}
