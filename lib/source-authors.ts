import { getSkillAuthorBySlug } from "@/lib/db/skill-authors";
import {
  EXTERNAL_SKILL_SOURCES,
  findSourceForUrl,
  type ExternalSkillSource,
} from "@/lib/external-skill-sources";

const authorIdCache = new Map<string, string | null>();

/**
 * Resolve the verified `skill_authors.id` for an external skill source.
 * Returns `undefined` when the source has no `authorSlug` or the author row
 * doesn't exist yet (e.g. migration hasn't run).
 */
export async function resolveSourceAuthorId(
  source: ExternalSkillSource,
): Promise<string | undefined> {
  if (!source.authorSlug) return undefined;

  const cached = authorIdCache.get(source.authorSlug);
  if (cached !== undefined) return cached ?? undefined;

  const author = await getSkillAuthorBySlug(source.authorSlug);
  authorIdCache.set(source.authorSlug, author?.id ?? null);
  return author?.id ?? undefined;
}

/**
 * Given an arbitrary URL, try to match it to a known external source and
 * return its verified author ID. Returns `undefined` for unknown URLs.
 */
export async function resolveAuthorIdForUrl(
  url: string,
): Promise<string | undefined> {
  const source = findSourceForUrl(url);
  if (!source) return undefined;
  return resolveSourceAuthorId(source);
}

/**
 * Batch-resolve author IDs for all external sources that have an `authorSlug`.
 * Useful during bulk imports to avoid N+1 queries.
 */
export async function prefetchSourceAuthorIds(): Promise<Map<string, string>> {
  const sourcesWithAuthor = EXTERNAL_SKILL_SOURCES.filter((s) => s.authorSlug);
  const results = await Promise.all(
    sourcesWithAuthor.map(async (s) => {
      const id = await resolveSourceAuthorId(s);
      return [s.id, id] as const;
    }),
  );
  return new Map(
    results.filter((r): r is [string, string] => r[1] !== undefined),
  );
}
