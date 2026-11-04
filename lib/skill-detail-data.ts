import "server-only";
import { unstable_cache } from "next/cache";

import {
  CACHE_TAGS,
  LONG_LIVED_CACHE_REVALIDATE_SECONDS,
  SKILL_ACTIVITY_REVALIDATE_SECONDS,
  skillCacheTag,
  skillLiveDataCacheTag,
} from "@/lib/cache-tags";
import { listSkillUpstreams } from "@/lib/db/skill-intelligence";
import {
  listLoopRuns,
  listLoopRunSummaries,
  listUsageEventsForSkill,
} from "@/lib/system-state";
import type { SkillOrigin } from "@/lib/types";

export async function getCachedSkillActivity(
  slug: string,
  origin: SkillOrigin
) {
  const runOrigin = origin === "remote" ? "remote" : "user";
  const loadActivity = unstable_cache(
    async () => {
      // The page shows only the latest run, and a full run row carries its whole transcript,
      // diff and sources, so fetch that one run instead of several to pick it from.
      const [loopRuns, latestRuns, usageEvents] = await Promise.all([
        listLoopRunSummaries({ limit: 20, skillSlug: slug }),
        listLoopRuns({ limit: 1, origin: runOrigin, skillSlug: slug }),
        listUsageEventsForSkill(slug, 100),
      ]);
      return { latestRun: latestRuns[0] ?? null, loopRuns, usageEvents };
    },
    ["skill-detail-activity-v4", slug, runOrigin],
    {
      revalidate: SKILL_ACTIVITY_REVALIDATE_SECONDS,
      tags: [
        CACHE_TAGS.skillActivity,
        skillCacheTag(slug),
        skillLiveDataCacheTag(slug),
      ],
    }
  );

  return loadActivity();
}

export async function getCachedSkillUpstreams(slug: string) {
  const loadUpstreams = unstable_cache(
    async () => listSkillUpstreams(slug),
    ["skill-detail-upstreams-v3", slug],
    {
      revalidate: LONG_LIVED_CACHE_REVALIDATE_SECONDS,
      tags: [
        CACHE_TAGS.skillUpstreams,
        skillCacheTag(slug),
        skillLiveDataCacheTag(slug),
      ],
    }
  );

  return loadUpstreams();
}
