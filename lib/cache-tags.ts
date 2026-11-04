export const CACHE_TAGS = {
  briefs: "briefs",
  publicCatalogue: "public-skill-catalogue",
  publicLanding: "public-landing",
  publicSitemap: "public-sitemap",
  skillActivity: "skill-activity",
  skillUpstreams: "skill-upstreams",
} as const;

export const LONG_LIVED_CACHE_REVALIDATE_SECONDS = 2_592_000;

// Only the latest version page reads activity, so this TTL also bounds how stale that page's
// usage stats get between saves. Archived version pages never read it and stay cached.
export const SKILL_ACTIVITY_REVALIDATE_SECONDS = 86_400;

// Every write that changes the public catalogue or the briefs expires them by tag, so this TTL
// only bounds edits that skip invalidation, such as an author's verified badge.
export const PUBLIC_CATALOGUE_REVALIDATE_SECONDS = 86_400;

/** Every cached page and data entry for the skill, archived versions included. */
export function skillCacheTag(slug: string): string {
  return `skill:${slug}`;
}

/** The cached record of one version, and the pages that render it. */
export function skillVersionCacheTag(slug: string, version: number): string {
  return `skill:${slug}:v${version}`;
}

/** Activity and upstreams, which only the latest version page shows. */
export function skillLiveDataCacheTag(slug: string): string {
  return `skill:${slug}:live`;
}

/**
 * What a routine save expires: the skill's live data and the given versions' records. Never
 * skillCacheTag, which would also expire every archived version.
 */
export function latestSkillVersionCacheTags(
  slug: string,
  versions: Iterable<number>
): string[] {
  return [
    skillLiveDataCacheTag(slug),
    ...[...new Set(versions)].map((version) =>
      skillVersionCacheTag(slug, version)
    ),
  ];
}
