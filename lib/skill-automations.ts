import { DEFAULT_PREFERRED_HOUR } from "@/lib/automation-constants";
import { formatScheduleLabel } from "@/lib/schedule";
import type { AutomationSummary, SkillRecord } from "@/lib/types";
import { AUTOMATION_NAME_MAX_LENGTH, clampField } from "@/lib/user-skills";

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
            name: clampField(
              `${skill.title} refresh`,
              AUTOMATION_NAME_MAX_LENGTH
            ),
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
