import { DEFAULT_PREFERRED_HOUR } from "@/lib/automation-constants";
import type { SkillAutomationState, SkillRecord } from "@/lib/types";

type AutomationSourceSkill = Pick<SkillRecord, "automation" | "title" | "slug">;

/**
 * Builds a SkillAutomationState from a source skill.
 * If the source has an active automation, copies its cadence, prompt, and
 * schedule so the fork runs on the same pattern. Otherwise returns a
 * paused default so the forked skill surfaces automation controls immediately.
 */
export function buildPausedAutomationFromSource(
  source: AutomationSourceSkill
): SkillAutomationState {
  if (source.automation) {
    const sourceActive =
      source.automation.enabled && source.automation.status === "active";

    return {
      ...source.automation,
      consecutiveFailures: undefined,
      enabled: sourceActive,
      lastRunAt: undefined,
      preferredHour: source.automation.preferredHour ?? DEFAULT_PREFERRED_HOUR,
      status: sourceActive ? "active" : "paused",
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
