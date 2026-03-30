import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authErrorResponse, requireActiveSubscription } from "@/lib/auth";
import {
  automationCadenceSchema,
  cadenceValueToSkillCadence,
  skillCadenceToRRule,
  type CadenceValue
} from "@/lib/automation-constants";
import { getSkillBySlug, updateSkill } from "@/lib/db/skills";
import { withApiUsage } from "@/lib/usage-server";
import type { SkillAutomationState, UserSkillAutomationStatus } from "@/lib/types";

const patchSchema = z.object({
  name: z.string().trim().min(3).max(80).optional(),
  cadence: automationCadenceSchema.optional(),
  status: z.enum(["ACTIVE", "PAUSED"]).optional(),
  prompt: z.string().trim().max(2000).optional()
});

function mapStatusToSkillStatus(status: string): UserSkillAutomationStatus {
  return status === "PAUSED" ? "paused" : "active";
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withApiUsage(
    { route: "/api/automations/[id]", method: "PATCH", label: "Update automation" },
    async () => {
      try {
        await requireActiveSubscription();
        const { id: skillSlug } = await context.params;

        const skill = await getSkillBySlug(skillSlug);
        if (!skill?.automation) {
          return Response.json({ error: "Automation not found." }, { status: 404 });
        }

        const patch = patchSchema.parse(await request.json());
        const current = skill.automation as SkillAutomationState;
        const updated: SkillAutomationState = { ...current };

        if (patch.cadence) {
          updated.cadence = cadenceValueToSkillCadence(patch.cadence as CadenceValue);
        }
        if (patch.status) {
          updated.status = mapStatusToSkillStatus(patch.status);
          updated.enabled = patch.status !== "PAUSED";
        }
        if (patch.prompt !== undefined) {
          updated.prompt = patch.prompt;
        }

        await updateSkill(skillSlug, { automation: updated });

        revalidatePath("/settings", "layout");
        revalidatePath("/");
        revalidatePath(`/skills/${skillSlug}`);

        return Response.json({ ok: true, id: skillSlug });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) return authResp;

        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ error: "Unable to update automation." }, { status: 400 });
      }
    }
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withApiUsage(
    { route: "/api/automations/[id]", method: "DELETE", label: "Delete automation" },
    async () => {
      try {
        await requireActiveSubscription();
        const { id: skillSlug } = await context.params;

        const skill = await getSkillBySlug(skillSlug);
        if (!skill?.automation) {
          return Response.json({ error: "Automation not found." }, { status: 404 });
        }

        const disabled: SkillAutomationState = {
          ...(skill.automation as SkillAutomationState),
          enabled: false,
          status: "paused"
        };

        await updateSkill(skillSlug, { automation: disabled });

        revalidatePath("/settings", "layout");
        revalidatePath("/");
        revalidatePath(`/skills/${skillSlug}`);

        return Response.json({ ok: true, id: skillSlug });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) return authResp;

        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ error: "Unable to delete automation." }, { status: 400 });
      }
    }
  );
}
