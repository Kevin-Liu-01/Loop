import { listMcps } from "@/lib/db/mcps";
import { listSkills } from "@/lib/db/skills";
import type { LandingMcpRow } from "@/lib/home-landing/landing-data";
import { buildSkillAutomationSummaries } from "@/lib/skill-automations";
import type { AutomationSummary, SkillRecord } from "@/lib/types";

export interface LandingData {
  skills: SkillRecord[];
  mcps: LandingMcpRow[];
  automations: AutomationSummary[];
}

export async function fetchLandingData(): Promise<LandingData> {
  const [allSkills, allMcps] = await Promise.all([
    listSkills({ visibility: "public" }).catch(() => [] as SkillRecord[]),
    listMcps().catch(() => []),
  ]);

  const verifiedSkills = allSkills.filter((s) => s.author?.verified);

  const skills = verifiedSkills
    .toSorted(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 10);

  const automations = verifiedSkills.flatMap((s) =>
    buildSkillAutomationSummaries(s)
  );

  const mcps: LandingMcpRow[] = allMcps.slice(0, 10).map((m) => ({
    description: m.description,
    homepageUrl: m.homepageUrl,
    iconUrl: m.iconUrl,
    id: m.id,
    name: m.name,
    transport: m.transport,
  }));

  return { automations, mcps, skills };
}
