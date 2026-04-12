import { DEFAULT_PREFERRED_HOUR } from "@/lib/automation-constants";
import { formatScheduleLabel } from "@/lib/schedule";
import type { AutomationSummary, SkillRecord } from "@/lib/types";

type SkillAutomationSource = Pick<
  SkillRecord,
  "slug" | "title" | "origin" | "automation" | "automations"
>;

export function buildSkillAutomationSummaries(
  skill: SkillAutomationSource
): AutomationSummary[] {
  const builtIn: AutomationSummary[] =
    skill.origin === "user" && skill.automation
      ? [
          {
            cadence: skill.automation.cadence,
            cwd: [],
            id: skill.slug,
            matchedCategorySlugs: [],
            matchedSkillSlugs: [skill.slug],
            name: `${skill.title} refresh`,
            path: "",
            preferredDay: skill.automation.preferredDay,
            preferredHour: skill.automation.preferredHour,
            preferredModel: skill.automation.preferredModel,
            prompt: skill.automation.prompt,
            schedule: formatScheduleLabel(
              skill.automation.cadence,
              skill.automation.preferredHour ?? DEFAULT_PREFERRED_HOUR,
              skill.automation.preferredDay
            ),
            status: skill.automation.status === "paused" ? "PAUSED" : "ACTIVE",
          },
        ]
      : [];

  return [...builtIn, ...skill.automations];
}
