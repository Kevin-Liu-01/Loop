import type { MetadataRoute } from "next";

import { buildMcpVersionHref } from "@/lib/format";
import { getLoopSnapshot } from "@/lib/refresh";
import { buildSiteUrl } from "@/lib/seo";
import { SETTINGS_BASE_PATH, SETTINGS_NAV_ITEMS } from "@/lib/settings-nav";

const STATIC_PATHS = [
  "/",
  "/faq",
  "/privacy",
  "/terms",
  "/sign-in",
  "/sign-up",
  SETTINGS_BASE_PATH,
  ...SETTINGS_NAV_ITEMS.map((item) => `${SETTINGS_BASE_PATH}/${item.id}`),
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let skillEntries: MetadataRoute.Sitemap = [];
  let mcpEntries: MetadataRoute.Sitemap = [];

  try {
    const snapshot = await getLoopSnapshot();

    skillEntries = snapshot.skills
      .filter((s) => s.visibility === "public")
      .map((s) => ({
        changeFrequency: "weekly" as const,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
        priority: s.featured ? 0.85 : 0.7,
        url: buildSiteUrl(s.href).toString(),
      }));

    mcpEntries = snapshot.mcps.map((mcp) => ({
      changeFrequency: "weekly" as const,
      lastModified: mcp.updatedAt ? new Date(mcp.updatedAt) : now,
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
