import "server-only";
import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { getBriefByCategory } from "@/lib/db/briefs";
import { listSkillUpstreams } from "@/lib/db/skill-intelligence";
import {
  listLoopRuns,
  listLoopRunSummaries,
  listUsageEventsForSkill,
} from "@/lib/system-state";

export const getCachedSkillActivity = unstable_cache(
  async (slug: string) => {
    const [loopRuns, recentRuns, usageEvents] = await Promise.all([
      listLoopRunSummaries({ limit: 20, skillSlug: slug }),
      listLoopRuns({ limit: 3, skillSlug: slug }),
      listUsageEventsForSkill(slug, 100),
    ]);
    return { loopRuns, recentRuns, usageEvents };
  },
  ["skill-detail-activity-v1"],
  { revalidate: 60, tags: [CACHE_TAGS.skillActivity] }
);

export const getCachedSkillBrief = unstable_cache(
  getBriefByCategory,
  ["skill-detail-brief-v1"],
  { revalidate: 300, tags: [CACHE_TAGS.briefs] }
);

export const getCachedSkillUpstreams = unstable_cache(
  listSkillUpstreams,
  ["skill-detail-upstreams-v1"],
  { revalidate: 300, tags: [CACHE_TAGS.skillUpstreams] }
);
