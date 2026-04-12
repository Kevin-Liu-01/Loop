import type { StatusDotTone } from "@/components/ui/status-dot";
import type { LoopRunRecord, SkillRecord } from "@/lib/types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

export interface FreshnessInfo {
  tone: StatusDotTone;
  label: string;
}

export function computeFreshness(
  skill: SkillRecord,
  loopRuns: LoopRunRecord[]
): FreshnessInfo {
  const latestRun = loopRuns.find((run) => run.slug === skill.slug);

  if (latestRun?.status === "error") {
    return { label: "Last update failed", tone: "error" };
  }

  if (skill.origin !== "user") {
    return { label: "Catalog skill", tone: "idle" };
  }

  const ageMs = Date.now() - new Date(skill.updatedAt).valueOf();

  if (skill.automation?.enabled && skill.automation.status === "active") {
    const cadenceMs =
      skill.automation.cadence === "daily" ? ONE_DAY_MS : SEVEN_DAYS_MS;
    const overdue = skill.automation.lastRunAt
      ? Date.now() - new Date(skill.automation.lastRunAt).valueOf() >= cadenceMs
      : true;

    if (overdue) {
      return { label: "Update due", tone: "stale" };
    }
    return { label: "Up to date", tone: "fresh" };
  }

  if (ageMs < ONE_DAY_MS) {
    return { label: "Updated recently", tone: "fresh" };
  }

  if (ageMs < SEVEN_DAYS_MS) {
    return { label: "No automation", tone: "idle" };
  }

  return { label: "Stale", tone: "stale" };
}
