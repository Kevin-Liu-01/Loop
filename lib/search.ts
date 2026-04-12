import { listBriefs } from "@/lib/db/briefs";
import { listCategories } from "@/lib/db/categories";
import { listMcps } from "@/lib/db/mcps";
import { searchSkills as dbSearchSkills } from "@/lib/db/search";
import { buildMcpVersionHref } from "@/lib/format";
import type { SearchHit, SkillOrigin } from "@/lib/types";

export interface SearchOptions {
  kind?: "skill" | "category" | "brief" | "mcp";
  category?: string;
  limit?: number;
}

export async function search(
  query: string,
  options: SearchOptions = {}
): Promise<SearchHit[]> {
  const limit = options.limit ?? 12;
  const normalizedQuery = query.trim().toLowerCase();

  if (!options.kind || options.kind === "skill") {
    return dbSearchSkills(query, {
      category: options.category,
      limit,
    });
  }

  if (options.kind === "category") {
    const categories = await listCategories();
    return categories
      .filter(
        (c) =>
          !normalizedQuery ||
          c.title.toLowerCase().includes(normalizedQuery) ||
          c.slug.includes(normalizedQuery)
      )
      .slice(0, limit)
      .map((c, i) => ({
        category: c.slug,
        description: c.description,
        href: `/categories/${c.slug}`,
        id: `category:${c.slug}`,
        kind: "category" as const,
        score: limit - i,
        tags: c.keywords,
        title: c.title,
        updatedAt: new Date().toISOString(),
      }));
  }

  if (options.kind === "brief") {
    const briefs = await listBriefs();
    return briefs
      .filter(
        (b) =>
          !normalizedQuery ||
          b.title.toLowerCase().includes(normalizedQuery) ||
          b.summary.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, limit)
      .map((b, i) => ({
        category: b.slug,
        description: b.summary,
        href: `/categories/${b.slug}`,
        id: `brief:${b.slug}`,
        kind: "brief" as const,
        score: limit - i,
        tags: b.items.flatMap((item) => item.tags),
        title: b.title,
        updatedAt: b.generatedAt,
      }));
  }

  if (options.kind === "mcp") {
    const mcps = await listMcps();
    return mcps
      .filter(
        (m) =>
          !normalizedQuery ||
          m.name.toLowerCase().includes(normalizedQuery) ||
          m.description.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, limit)
      .map((m, i) => ({
        description: m.description,
        href: buildMcpVersionHref(m.name, m.version),
        id: `mcp:${m.id}:${m.version}`,
        kind: "mcp" as const,
        origin: "system" as SkillOrigin | "system",
        score: limit - i,
        tags: m.tags,
        title: m.name,
        updatedAt: m.updatedAt,
        versionLabel: m.versionLabel,
      }));
  }

  return [];
}

export { searchSkills } from "@/lib/db/search";
export { buildSearchIndex, searchIndex } from "@/lib/search-index";
