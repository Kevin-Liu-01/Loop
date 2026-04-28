import { isAdminEmail } from "@/lib/admin";
import { getUserSubscription } from "@/lib/auth";
import {
  countUserActiveAutomations,
  countUserPublicSkills,
  countUserSkills,
} from "@/lib/db/skills";
import { listLoopRuns } from "@/lib/system-state";
import type { SkillAutomationState, UserSkillCadence } from "@/lib/types";

export const FREE_AUTOMATION_LIMIT = 3;
export const OPERATOR_AUTOMATION_LIMIT = Infinity;
export const MAX_SKILLS_PER_USER = 10;
export const MAX_PUBLIC_SKILLS_PER_USER = 20;
export const SKILL_CREATE_COOLDOWN_MS = 30 * 1000;
export const MAX_SLUG_COLLISION_ATTEMPTS = 10;

export const MANUAL_UPDATE_COOLDOWN_MS = 15 * 60 * 1000;

export const AUTOMATION_PROXIMITY_MS = 60 * 60 * 1000;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const recentCreates = new Map<string, number>();

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

export async function getManualUpdateCooldown(slug: string): Promise<{
  allowed: boolean;
  remainingMs: number;
  lastRunAt: string | null;
}> {
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
  if (Number.isNaN(elapsed) || elapsed >= MANUAL_UPDATE_COOLDOWN_MS) {
    return { allowed: true, lastRunAt, remainingMs: 0 };
  }
  const remainingMs = MANUAL_UPDATE_COOLDOWN_MS - elapsed;
  return { allowed: false, lastRunAt, remainingMs };
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
