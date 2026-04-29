import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import {
  isValidCronSlotHour,
  isValidDayOfWeek,
} from "@/lib/automation-constants";
import { findSkillAuthorForSession } from "@/lib/db/skill-authors";
import { getSkillBySlug, updateSkill } from "@/lib/db/skills";
import { canSessionEditSkill } from "@/lib/skill-authoring";
import { canCreateAutomation } from "@/lib/skill-limits";
import type {
  SkillAutomationState,
  UserSkillAutomationStatus,
} from "@/lib/types";
import { withApiUsage } from "@/lib/usage-server";
import { AUTOMATION_NAME_MAX_LENGTH, normalizeSource } from "@/lib/user-skills";

const patchSchema = z.object({
  cadence: z.enum(["daily", "weekly", "manual"]).optional(),
  name: z.string().trim().min(3).max(AUTOMATION_NAME_MAX_LENGTH).optional(),
  preferredDay: z.number().int().min(0).max(6).optional(),
  preferredHour: z.number().int().min(0).max(23).optional(),
  preferredModel: z.string().trim().max(120).optional(),
  prompt: z.string().trim().max(2000).optional(),
  sourceUrls: z.array(z.string().url().max(2000)).max(50).optional(),
  status: z.enum(["ACTIVE", "PAUSED"]).optional(),
});

function mapStatusToSkillStatus(status: string): UserSkillAutomationStatus {
  return status === "PAUSED" ? "paused" : "active";
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  return withApiUsage(
    {
      label: "Update automation",
      method: "PATCH",
      route: "/api/automations/[id]",
    },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await findSkillAuthorForSession(session);
        const { id: skillSlug } = await context.params;

        const skill = await getSkillBySlug(skillSlug);
        if (!skill?.automation) {
          return Response.json(
            { error: "Automation not found." },
            { status: 404 }
          );
        }

        if (!canSessionEditSkill(skill, session, sessionAuthor)) {
          return Response.json(
            { error: "Only the skill owner can update this automation." },
            { status: 403 }
          );
        }

        const patch = patchSchema.parse(await request.json());
        const current = skill.automation as SkillAutomationState;

        const isEnabling = patch.status === "ACTIVE" && !current.enabled;
        if (isEnabling) {
          const limits = await canCreateAutomation(
            session.userId,
            session.email
          );
          if (!limits.allowed) {
            return Response.json(
              {
                activeCount: limits.activeCount,
                error: limits.reason ?? "Automation limit reached.",
                isOperator: limits.isOperator,
                limit: limits.limit,
              },
              { status: 403 }
            );
          }
        }

        const updated: SkillAutomationState = { ...current };

        if (patch.cadence) {
          updated.cadence = patch.cadence;
        }
        if (patch.status) {
          updated.status = mapStatusToSkillStatus(patch.status);
          updated.enabled = patch.status !== "PAUSED";
        }
        if (patch.prompt !== undefined) {
          updated.prompt = patch.prompt;
        }
        if (patch.preferredModel !== undefined) {
          updated.preferredModel = patch.preferredModel || undefined;
        }
        if (
          patch.preferredHour !== undefined &&
          isValidCronSlotHour(patch.preferredHour)
        ) {
          updated.preferredHour = patch.preferredHour;
        }
        if (
          patch.preferredDay !== undefined &&
          isValidDayOfWeek(patch.preferredDay)
        ) {
          updated.preferredDay = patch.preferredDay;
        }

        const skillUpdates: Parameters<typeof updateSkill>[1] = {
          automation: updated,
        };

        if (patch.sourceUrls) {
          skillUpdates.sources = patch.sourceUrls.map((url) =>
            normalizeSource(url, skill.category)
          );
        }

        await updateSkill(skillSlug, skillUpdates);

        revalidatePath("/settings", "layout");
        revalidatePath("/");
        revalidatePath(`/skills/${skillSlug}`);

        return Response.json({ id: skillSlug, ok: true });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) {
          return authResp;
        }

        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json(
          { error: "Unable to update automation." },
          { status: 400 }
        );
      }
    }
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withApiUsage(
    {
      label: "Delete automation",
      method: "DELETE",
      route: "/api/automations/[id]",
    },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await findSkillAuthorForSession(session);
        const { id: skillSlug } = await context.params;

        const skill = await getSkillBySlug(skillSlug);
        if (!skill?.automation) {
          return Response.json(
            { error: "Automation not found." },
            { status: 404 }
          );
        }

        if (!canSessionEditSkill(skill, session, sessionAuthor)) {
          return Response.json(
            { error: "Only the skill owner can disable this automation." },
            { status: 403 }
          );
        }

        const disabled: SkillAutomationState = {
          ...(skill.automation as SkillAutomationState),
          enabled: false,
          status: "paused",
        };

        await updateSkill(skillSlug, { automation: disabled });

        revalidatePath("/settings", "layout");
        revalidatePath("/");
        revalidatePath(`/skills/${skillSlug}`);

        return Response.json({ id: skillSlug, ok: true });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) {
          return authResp;
        }

        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json(
          { error: "Unable to delete automation." },
          { status: 400 }
        );
      }
    }
  );
}
