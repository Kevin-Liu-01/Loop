import { isAdminEmail } from "@/lib/admin";
import { getUserSubscription } from "@/lib/auth";
import { countUserConversations } from "@/lib/db/conversations";
import {
  countUserActiveAutomations,
  countUserPublicSkills,
  countUserSkills,
} from "@/lib/db/skills";
import {
  AUTOMATION_PROXIMITY_MS,
  FREE_AUTOMATION_LIMIT,
  FREE_CONVERSATION_LIMIT,
  FREE_DAILY_AGENT_RUN_LIMIT,
  FREE_MANUAL_UPDATE_COOLDOWN_MS,
  FREE_SANDBOX_CONVERSATION_LIMIT,
  MANUAL_UPDATE_COOLDOWN_MS,
  MAX_PUBLIC_SKILLS_PER_USER,
  MAX_SKILLS_PER_USER,
  MAX_SLUG_COLLISION_ATTEMPTS,
  MS_PER_DAY,
  OPERATOR_AUTOMATION_LIMIT,
  OPERATOR_CONVERSATION_LIMIT,
  OPERATOR_DAILY_AGENT_RUN_LIMIT,
  OPERATOR_MANUAL_UPDATE_COOLDOWN_MS,
  OPERATOR_SANDBOX_CONVERSATION_LIMIT,
  SKILL_CREATE_COOLDOWN_MS,
} from "@/lib/skill-limit-constants";
import { listLoopRuns } from "@/lib/system-state";
import type {
  ConversationChannel,
  SkillAutomationState,
  UserSkillCadence,
} from "@/lib/types";

export {
  AUTOMATION_PROXIMITY_MS,
  FREE_AUTOMATION_LIMIT,
  FREE_CONVERSATION_LIMIT,
  FREE_DAILY_AGENT_RUN_LIMIT,
  FREE_MANUAL_UPDATE_COOLDOWN_MS,
  FREE_SANDBOX_CONVERSATION_LIMIT,
  MANUAL_UPDATE_COOLDOWN_MS,
  MAX_PUBLIC_SKILLS_PER_USER,
  MAX_SKILLS_PER_USER,
  MAX_SLUG_COLLISION_ATTEMPTS,
  OPERATOR_AUTOMATION_LIMIT,
  OPERATOR_CONVERSATION_LIMIT,
  OPERATOR_DAILY_AGENT_RUN_LIMIT,
  OPERATOR_MANUAL_UPDATE_COOLDOWN_MS,
  OPERATOR_SANDBOX_CONVERSATION_LIMIT,
  SKILL_CREATE_COOLDOWN_MS,
} from "@/lib/skill-limit-constants";

const recentCreates = new Map<string, number>();

const dailyAgentRuns = new Map<string, number[]>();

function pruneOldTimestamps(timestamps: number[]): number[] {
  const cutoff = Date.now() - MS_PER_DAY;
  return timestamps.filter((ts) => ts > cutoff);
}

function getDailyRunCount(clerkUserId: string): number {
  const timestamps = dailyAgentRuns.get(clerkUserId);
  if (!timestamps) {
    return 0;
  }
  const pruned = pruneOldTimestamps(timestamps);
  dailyAgentRuns.set(clerkUserId, pruned);
  return pruned.length;
}

export function recordAgentRun(clerkUserId: string): void {
  const timestamps = dailyAgentRuns.get(clerkUserId) ?? [];
  timestamps.push(Date.now());
  dailyAgentRuns.set(clerkUserId, pruneOldTimestamps(timestamps));

  if (dailyAgentRuns.size > 10_000) {
    const cutoff = Date.now() - MS_PER_DAY;
    for (const [key, ts] of dailyAgentRuns) {
      const pruned = ts.filter((t) => t > cutoff);
      if (pruned.length === 0) {
        dailyAgentRuns.delete(key);
      } else {
        dailyAgentRuns.set(key, pruned);
      }
    }
  }
}

function cadenceIntervalMs(cadence: UserSkillCadence): number | null {
  if (cadence === "daily") {
    return MS_PER_DAY;
  }
  if (cadence === "weekly") {
    return 7 * MS_PER_DAY;
  }
  return null;
}

export async function canCreateSkill(
  clerkUserId: string,
  email?: string
): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
  isOperator: boolean;
  reason?: string;
}> {
  const [currentCount, subscription] = await Promise.all([
    countUserSkills(clerkUserId),
    getUserSubscription(clerkUserId),
  ]);
  const isOperator =
    subscription !== null || (email ? isAdminEmail(email) : false);
  const isAdmin = email ? isAdminEmail(email) : false;
  const limit = MAX_SKILLS_PER_USER;

  if (!isAdmin && currentCount >= limit) {
    return {
      allowed: false,
      currentCount,
      isOperator,
      limit,
      reason: `You can create up to ${MAX_SKILLS_PER_USER} skills on Loop.`,
    };
  }

  const lastCreate = recentCreates.get(clerkUserId);
  if (
    !isAdmin &&
    lastCreate &&
    Date.now() - lastCreate < SKILL_CREATE_COOLDOWN_MS
  ) {
    const waitSec = Math.ceil(
      (SKILL_CREATE_COOLDOWN_MS - (Date.now() - lastCreate)) / 1000
    );
    return {
      allowed: false,
      currentCount,
      isOperator,
      limit,
      reason: `Please wait ${waitSec}s before creating another skill.`,
    };
  }

  return { allowed: true, currentCount, isOperator, limit };
}

export function recordSkillCreate(clerkUserId: string): void {
  recentCreates.set(clerkUserId, Date.now());
  if (recentCreates.size > 10_000) {
    const cutoff = Date.now() - SKILL_CREATE_COOLDOWN_MS * 2;
    for (const [key, ts] of recentCreates) {
      if (ts < cutoff) {
        recentCreates.delete(key);
      }
    }
  }
}

export async function canCreateAutomation(
  clerkUserId: string,
  email?: string
): Promise<{
  allowed: boolean;
  activeCount: number;
  limit: number;
  isOperator: boolean;
  reason?: string;
}> {
  const [activeCount, subscription] = await Promise.all([
    countUserActiveAutomations(clerkUserId),
    getUserSubscription(clerkUserId),
  ]);
  const isOperator =
    subscription !== null || (email ? isAdminEmail(email) : false);
  const isAdmin = email ? isAdminEmail(email) : false;
  const limit = isOperator ? OPERATOR_AUTOMATION_LIMIT : FREE_AUTOMATION_LIMIT;

  if (!isAdmin && activeCount >= limit) {
    return {
      activeCount,
      allowed: false,
      isOperator,
      limit,
      reason: isOperator
        ? "You've reached the maximum number of automations."
        : `Free accounts can have up to ${FREE_AUTOMATION_LIMIT} active automations. Upgrade to Operator for more.`,
    };
  }

  return { activeCount, allowed: true, isOperator, limit };
}

export async function canMakeSkillPublic(
  clerkUserId: string,
  email?: string
): Promise<{
  allowed: boolean;
  publicCount: number;
  limit: number;
  reason?: string;
}> {
  const isAdmin = email ? isAdminEmail(email) : false;
  if (isAdmin) {
    return { allowed: true, publicCount: 0, limit: MAX_PUBLIC_SKILLS_PER_USER };
  }
  const publicCount = await countUserPublicSkills(clerkUserId);
  if (publicCount >= MAX_PUBLIC_SKILLS_PER_USER) {
    return {
      allowed: false,
      limit: MAX_PUBLIC_SKILLS_PER_USER,
      publicCount,
      reason: `You can have at most ${MAX_PUBLIC_SKILLS_PER_USER} public skills.`,
    };
  }
  return { allowed: true, limit: MAX_PUBLIC_SKILLS_PER_USER, publicCount };
}

export async function getManualUpdateCooldown(
  slug: string,
  options?: { clerkUserId?: string; email?: string }
): Promise<{
  allowed: boolean;
  remainingMs: number;
  lastRunAt: string | null;
}> {
  let isOperator = false;
  if (options?.clerkUserId) {
    const subscription = await getUserSubscription(options.clerkUserId);
    isOperator =
      subscription !== null ||
      (options.email ? isAdminEmail(options.email) : false);
  }
  const cooldownMs = isOperator
    ? OPERATOR_MANUAL_UPDATE_COOLDOWN_MS
    : FREE_MANUAL_UPDATE_COOLDOWN_MS;

  const runs = await listLoopRuns({
    skillSlug: slug,
    trigger: "manual",
    limit: 1,
  });
  const lastManual = runs[0];
  if (!lastManual) {
    return { allowed: true, lastRunAt: null, remainingMs: 0 };
  }
  const lastRunAt = lastManual.startedAt;
  const elapsed = Date.now() - Date.parse(lastRunAt);
  if (Number.isNaN(elapsed) || elapsed >= cooldownMs) {
    return { allowed: true, lastRunAt, remainingMs: 0 };
  }
  const remainingMs = cooldownMs - elapsed;
  return { allowed: false, lastRunAt, remainingMs };
}

export async function canCreateConversation(
  clerkUserId: string,
  channel: ConversationChannel,
  email?: string
): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
  isOperator: boolean;
  reason?: string;
}> {
  const [subscription, totalCount, sandboxCount] = await Promise.all([
    getUserSubscription(clerkUserId),
    countUserConversations(clerkUserId),
    channel === "sandbox"
      ? countUserConversations(clerkUserId, "sandbox")
      : Promise.resolve(0),
  ]);
  const isOperator =
    subscription !== null || (email ? isAdminEmail(email) : false);
  const isAdmin = email ? isAdminEmail(email) : false;

  if (isAdmin) {
    return {
      allowed: true,
      currentCount: totalCount,
      isOperator: true,
      limit: Infinity,
    };
  }

  const totalLimit = isOperator
    ? OPERATOR_CONVERSATION_LIMIT
    : FREE_CONVERSATION_LIMIT;
  if (totalCount >= totalLimit) {
    return {
      allowed: false,
      currentCount: totalCount,
      isOperator,
      limit: totalLimit,
      reason: isOperator
        ? undefined
        : `Free accounts can have up to ${FREE_CONVERSATION_LIMIT} conversations. Upgrade to Operator for unlimited.`,
    };
  }

  if (channel === "sandbox") {
    const sandboxLimit = isOperator
      ? OPERATOR_SANDBOX_CONVERSATION_LIMIT
      : FREE_SANDBOX_CONVERSATION_LIMIT;
    if (sandboxCount >= sandboxLimit) {
      return {
        allowed: false,
        currentCount: sandboxCount,
        isOperator,
        limit: sandboxLimit,
        reason: `Free accounts can have up to ${FREE_SANDBOX_CONVERSATION_LIMIT} sandbox conversations. Upgrade to Operator for unlimited.`,
      };
    }
  }

  return {
    allowed: true,
    currentCount: totalCount,
    isOperator,
    limit: totalLimit,
  };
}

export async function canRunAgentMessage(
  clerkUserId: string,
  email?: string
): Promise<{
  allowed: boolean;
  dailyCount: number;
  limit: number;
  isOperator: boolean;
  reason?: string;
}> {
  const subscription = await getUserSubscription(clerkUserId);
  const isOperator =
    subscription !== null || (email ? isAdminEmail(email) : false);
  const isAdmin = email ? isAdminEmail(email) : false;

  if (isAdmin) {
    return {
      allowed: true,
      dailyCount: 0,
      isOperator: true,
      limit: Infinity,
    };
  }

  const limit = isOperator
    ? OPERATOR_DAILY_AGENT_RUN_LIMIT
    : FREE_DAILY_AGENT_RUN_LIMIT;
  const dailyCount = getDailyRunCount(clerkUserId);

  if (dailyCount >= limit) {
    return {
      allowed: false,
      dailyCount,
      isOperator,
      limit,
      reason: `You've reached the daily limit of ${limit} agent messages. ${isOperator ? "Try again tomorrow." : "Upgrade to Operator for unlimited."}`,
    };
  }

  return { allowed: true, dailyCount, isOperator, limit };
}

export function isAutomationImminent(
  automation: SkillAutomationState | undefined
): { imminent: boolean; nextRunAt: string | null } {
  if (!automation?.enabled || automation.status !== "active") {
    return { imminent: false, nextRunAt: null };
  }
  const intervalMs = cadenceIntervalMs(automation.cadence);
  if (intervalMs === null) {
    return { imminent: false, nextRunAt: null };
  }
  const lastRunIso = automation.lastRunAt;
  if (!lastRunIso) {
    return { imminent: false, nextRunAt: null };
  }
  const lastMs = Date.parse(lastRunIso);
  if (Number.isNaN(lastMs)) {
    return { imminent: false, nextRunAt: null };
  }
  const nextMs = lastMs + intervalMs;
  const nextRunAt = new Date(nextMs).toISOString();
  const now = Date.now();
  if (nextMs <= now) {
    return { imminent: true, nextRunAt };
  }
  if (nextMs - now <= AUTOMATION_PROXIMITY_MS) {
    return { imminent: true, nextRunAt };
  }
  return { imminent: false, nextRunAt };
}
