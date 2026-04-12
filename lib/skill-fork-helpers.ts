import { DEFAULT_PREFERRED_HOUR } from "@/lib/automation-constants";
import type { SkillAutomationState, SkillRecord } from "@/lib/types";

type AutomationSourceSkill = Pick<SkillRecord, "automation" | "title" | "slug">;

/**
 * Builds a paused SkillAutomationState from a source skill.
 * If the source already has automation, copies its cadence and prompt but
 * starts paused. Otherwise returns a sensible default so the forked/copied
 * skill surfaces automation controls immediately.
 */
export function buildPausedAutomationFromSource(
  source: AutomationSourceSkill
): SkillAutomationState {
  if (source.automation) {
    return {
      ...source.automation,
      consecutiveFailures: undefined,
      enabled: false,
      lastRunAt: undefined,
      preferredHour: source.automation.preferredHour ?? DEFAULT_PREFERRED_HOUR,
      status: "paused",
    };
  }

  return {
    cadence: "daily",
    enabled: false,
    preferredHour: DEFAULT_PREFERRED_HOUR,
    prompt: `Refresh $${source.slug}: search the web for recent developments, cross-reference with tracked sources, and update the skill with concrete changes. Prioritize new versions, deprecations, and revised best practices. Stay terse and operational.`,
    status: "paused",
  };
}
