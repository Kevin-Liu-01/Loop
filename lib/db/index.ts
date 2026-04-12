export { getServerSupabase, getAnonSupabase } from "@/lib/db/client";

export {
  listCategories,
  getCategoryBySlug,
  upsertCategory,
  seedCategories,
} from "@/lib/db/categories";

export {
  listSkills,
  getSkillBySlug,
  getSkillAtVersion,
  createSkill,
  updateSkill,
  deleteSkill,
  upsertSkillFromFilesystem,
  getSkillIdBySlug,
  rowToSkillRecord,
} from "@/lib/db/skills";
export type { CreateSkillInput } from "@/lib/db/skills";

export { createSkillVersion, getSkillVersions } from "@/lib/db/skill-versions";
export type { CreateSkillVersionInput } from "@/lib/db/skill-versions";

export { listMcps, upsertMcp, createMcpVersion } from "@/lib/db/mcps";

export { listBriefs, getBriefByCategory, upsertBrief } from "@/lib/db/briefs";

export {
  recordLoopRun,
  listLoopRuns,
  recordRefreshRun,
  listRefreshRuns,
  recordUsageEvent,
  listUsageEvents,
  listUsageEventsSince,
  recordBillingEvent,
  upsertSubscription,
  listSubscriptions,
} from "@/lib/db/system-state";

export { searchSkills } from "@/lib/db/search";

export {
  upsertConversation,
  listConversations,
  getConversation,
  deleteConversation,
} from "@/lib/db/conversations";
