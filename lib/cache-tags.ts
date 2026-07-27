export const CACHE_TAGS = {
  briefs: "briefs",
  publicCatalogue: "public-skill-catalogue",
  publicLanding: "public-landing",
  publicSitemap: "public-sitemap",
  skillActivity: "skill-activity",
  skillUpstreams: "skill-upstreams",
} as const;

export function skillCacheTag(slug: string): string {
  return `skill:${slug}`;
}
