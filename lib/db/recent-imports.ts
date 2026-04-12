import { getServerSupabase } from "@/lib/db/client";
import type { CategorySlug } from "@/lib/types";

export interface RecentImportItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  iconUrl?: string;
  kind: "skill" | "mcp";
  sourceLabel?: string;
  sourceUrl?: string;
  authorName?: string;
  importedAt: string;
}

interface SkillImportRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  icon_url: string | null;
  owner_name: string | null;
  source_url: string | null;
  created_at: string;
}

interface McpImportRow {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  homepage_url: string | null;
  created_at: string;
}

export async function listRecentImports(
  limit = 20
): Promise<RecentImportItem[]> {
  const db = getServerSupabase();

  const [skillsResult, mcpsResult] = await Promise.all([
    db
      .from("skills")
      .select(
        "id, slug, title, description, category, icon_url, owner_name, source_url, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    db
      .from("imported_mcps")
      .select("id, name, description, icon_url, homepage_url, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const skills: RecentImportItem[] = (
    (skillsResult.data ?? []) as unknown as SkillImportRow[]
  ).map((row) => ({
    authorName: row.owner_name ?? undefined,
    category: row.category as CategorySlug,
    description: row.description,
    iconUrl: row.icon_url ?? undefined,
    id: row.id,
    importedAt: row.created_at,
    kind: "skill",
    slug: row.slug,
    sourceUrl: row.source_url ?? undefined,
    title: row.title,
  }));

  const mcps: RecentImportItem[] = (
    (mcpsResult.data ?? []) as unknown as McpImportRow[]
  ).map((row) => ({
    category: "infra" as CategorySlug,
    description: row.description,
    iconUrl: row.icon_url ?? undefined,
    id: row.id,
    importedAt: row.created_at,
    kind: "mcp",
    slug: row.name,
    sourceUrl: row.homepage_url ?? undefined,
    title: row.name,
  }));

  return [...skills, ...mcps]
    .toSorted(
      (a, b) =>
        new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime()
    )
    .slice(0, limit);
}
