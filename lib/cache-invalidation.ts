import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS, skillCacheTag } from "@/lib/cache-tags";

interface InvalidateSkillDataOptions {
  slug: string;
  href?: string;
  categorySlugs?: string[];
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

export function invalidateSkillData({
  slug,
  href,
  categorySlugs = [],
}: InvalidateSkillDataOptions): void {
  expireTag(skillCacheTag(slug));
  expireTag(CACHE_TAGS.skillActivity);
  expireTag(CACHE_TAGS.skillUpstreams);
  invalidatePublicCatalogue();
  revalidatePath(`/skills/${slug}`);
  if (href) {
    revalidatePath(href);
  }
  for (const categorySlug of new Set(categorySlugs)) {
    revalidatePath(`/categories/${categorySlug}`);
  }
}
