import { revalidatePath, revalidateTag } from "next/cache";

import {
  CACHE_TAGS,
  latestSkillVersionCacheTags,
  skillCacheTag,
} from "@/lib/cache-tags";

interface InvalidateSkillDataOptions {
  slug: string;
  href?: string;
  categorySlugs?: string[];
}

interface InvalidateLatestSkillVersionOptions extends InvalidateSkillDataOptions {
  /** The current version, plus the one it replaced when a save added a version. */
  versions: number[];
}

function expireTag(tag: string): void {
  revalidateTag(tag, { expire: 0 });
}

export function invalidatePublicCatalogue(): void {
  expireTag(CACHE_TAGS.publicCatalogue);
  expireTag(CACHE_TAGS.publicLanding);
  expireTag(CACHE_TAGS.publicSitemap);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
}

export function invalidateBriefs(): void {
  expireTag(CACHE_TAGS.briefs);
}

function revalidateSkillPaths({
  slug,
  href,
  categorySlugs = [],
}: InvalidateSkillDataOptions): void {
  invalidatePublicCatalogue();
  revalidatePath(`/skills/${slug}`);
  if (href) {
    revalidatePath(href);
  }
  for (const categorySlug of new Set(categorySlugs)) {
    revalidatePath(`/categories/${categorySlug}`);
  }
}

/**
 * Re-renders only the pages a routine save changes: the latest version (activity, usage,
 * automation status) and, when the save added a version, the version it replaced, which turns
 * into an archived snapshot. Older archived versions are immutable and stay cached; expiring
 * them on every automated refresh made crawlers re-render ~100 versions per refreshed skill.
 */
export function invalidateLatestSkillVersion({
  versions,
  ...options
}: InvalidateLatestSkillVersionOptions): void {
  for (const tag of latestSkillVersionCacheTags(options.slug, versions)) {
    expireTag(tag);
  }
  revalidateSkillPaths(options);
}

/**
 * Expires every cached page and data entry for the skill, archived versions included. Use it
 * when something archived versions show changes: visibility, deletion, metadata or icon edits.
 */
export function invalidateSkillData(options: InvalidateSkillDataOptions): void {
  expireTag(skillCacheTag(options.slug));
  revalidateSkillPaths(options);
}
