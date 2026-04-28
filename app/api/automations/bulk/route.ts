import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import { findSkillAuthorForSession } from "@/lib/db/skill-authors";
import { getSkillBySlug, updateSkill } from "@/lib/db/skills";
import { canSessionEditSkill } from "@/lib/skill-authoring";
import type { SkillAutomationState } from "@/lib/types";
import { withApiUsage } from "@/lib/usage-server";

const bulkSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(100),
  status: z.enum(["ACTIVE", "PAUSED"]),
});

export async function PATCH(request: Request) {
  return withApiUsage(
    {
      label: "Bulk update automations",
      method: "PATCH",
      route: "/api/automations/bulk",
    },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await findSkillAuthorForSession(session);
        const { ids, status } = bulkSchema.parse(await request.json());

        const results: { id: string; ok: boolean; error?: string }[] = [];

        for (const skillSlug of ids) {
          const skill = await getSkillBySlug(skillSlug);
          if (!skill?.automation) {
            results.push({ error: "Not found", id: skillSlug, ok: false });
            continue;
          }
          if (!canSessionEditSkill(skill, session, sessionAuthor)) {
            results.push({ error: "Forbidden", id: skillSlug, ok: false });
            continue;
          }

          const current = skill.automation as SkillAutomationState;
          const updated: SkillAutomationState = {
            ...current,
            enabled: status !== "PAUSED",
            status: status === "PAUSED" ? "paused" : "active",
          };

          await updateSkill(skillSlug, { automation: updated });
          revalidatePath(`/skills/${skillSlug}`);
          results.push({ id: skillSlug, ok: true });
        }

        revalidatePath("/settings", "layout");
        revalidatePath("/");

        return Response.json({ ok: true, results });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) {
          return authResp;
        }
        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json(
          { error: "Unable to update automations." },
          { status: 400 }
        );
      }
    }
  );
}
