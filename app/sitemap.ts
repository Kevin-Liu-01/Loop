import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { getServerSupabase } from "@/lib/db/client";
import { buildMcpVersionHref, buildSkillVersionHref } from "@/lib/format";
import { buildSiteUrl } from "@/lib/seo";

// Only public, indexable pages belong in the sitemap. Auth pages
// (sign-in/sign-up) and the authenticated dashboard (settings/*) are
// intentionally excluded — they should not be crawl targets.
const STATIC_PATHS = ["/", "/faq", "/privacy", "/terms"] as const;

async function loadSitemapRows() {
  const db = getServerSupabase();
  const [skills, mcps] = await Promise.all([
    db
      .from("skills")
      .select("slug,version,featured,updated_at")
      .eq("visibility", "public"),
    db.from("imported_mcps").select("name,version,updated_at"),
  ]);

  if (skills.error) {
    throw new Error(`Sitemap skills query failed: ${skills.error.message}`);
  }
  if (mcps.error) {
    throw new Error(`Sitemap MCP query failed: ${mcps.error.message}`);
  }

  return { mcps: mcps.data ?? [], skills: skills.data ?? [] };
}

const getCachedSitemapRows = unstable_cache(
  loadSitemapRows,
  ["public-sitemap-rows-v1"],
  { revalidate: 300, tags: [CACHE_TAGS.publicSitemap] }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let skillEntries: MetadataRoute.Sitemap = [];
  let mcpEntries: MetadataRoute.Sitemap = [];

  try {
    const rows = await getCachedSitemapRows();

    skillEntries = rows.skills.map((skill) => ({
      changeFrequency: "weekly" as const,
      lastModified: new Date(skill.updated_at),
      priority: skill.featured ? 0.85 : 0.7,
      url: buildSiteUrl(
        buildSkillVersionHref(skill.slug, skill.version)
      ).toString(),
    }));

    mcpEntries = rows.mcps.map((mcp) => ({
      changeFrequency: "weekly" as const,
      lastModified: new Date(mcp.updated_at),
      priority: 0.65,
      url: buildSiteUrl(buildMcpVersionHref(mcp.name, mcp.version)).toString(),
    }));
  } catch {
    // Graceful degradation when DB/env is unavailable
  }

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    changeFrequency: path === "/" ? ("daily" as const) : ("monthly" as const),
    lastModified: now,
    priority: path === "/" ? 1 : 0.5,
    url: buildSiteUrl(path).toString(),
  }));

  return [...staticEntries, ...skillEntries, ...mcpEntries];
}
