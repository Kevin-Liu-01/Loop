import "server-only";
import { unstable_cache } from "next/cache";

import {
  CACHE_TAGS,
  LONG_LIVED_CACHE_REVALIDATE_SECONDS,
  skillCacheTag,
} from "@/lib/cache-tags";
import { getBriefByCategory } from "@/lib/db/briefs";
import { listSkillUpstreams } from "@/lib/db/skill-intelligence";
import {
  listLoopRuns,
  listLoopRunSummaries,
  listUsageEventsForSkill,
} from "@/lib/system-state";

export async function getCachedSkillActivity(slug: string) {
  const loadActivity = unstable_cache(
    async () => {
      const [loopRuns, recentRuns, usageEvents] = await Promise.all([
        listLoopRunSummaries({ limit: 20, skillSlug: slug }),
        listLoopRuns({ limit: 3, skillSlug: slug }),
        listUsageEventsForSkill(slug, 100),
      ]);
      return { loopRuns, recentRuns, usageEvents };
    },
    ["skill-detail-activity-v2", slug],
    {
      revalidate: LONG_LIVED_CACHE_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.skillActivity, skillCacheTag(slug)],
    }
  );

  return loadActivity();
}

export const getCachedSkillBrief = unstable_cache(
  getBriefByCategory,
  ["skill-detail-brief-v2"],
  {
    revalidate: LONG_LIVED_CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.briefs],
  }
);

export async function getCachedSkillUpstreams(slug: string) {
  const loadUpstreams = unstable_cache(
    async () => listSkillUpstreams(slug),
    ["skill-detail-upstreams-v2", slug],
    {
      revalidate: LONG_LIVED_CACHE_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.skillUpstreams, skillCacheTag(slug)],
    }
  );

  return loadUpstreams();
}
