import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import {
  DEFAULT_PREFERRED_DAY,
  DEFAULT_PREFERRED_HOUR,
  isValidCronSlotHour,
  isValidDayOfWeek,
} from "@/lib/automation-constants";
import { getSkillCatalogue, getSkillRecordBySlug } from "@/lib/content";
import { findSkillAuthorForSession } from "@/lib/db/skill-authors";
import { updateSkill } from "@/lib/db/skills";
import { canSessionEditSkill } from "@/lib/skill-authoring";
import { canCreateAutomation } from "@/lib/skill-limits";
import type { SkillAutomationState } from "@/lib/types";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";
import { AUTOMATION_NAME_MAX_LENGTH } from "@/lib/user-skills";

const createSchema = z.object({
  cadence: z.enum(["daily", "weekly", "manual"]),
  name: z.string().trim().min(3).max(AUTOMATION_NAME_MAX_LENGTH),
  note: z.string().trim().max(240).optional().default(""),
  preferredDay: z.number().int().min(0).max(6).optional(),
  preferredHour: z.number().int().min(0).max(23).optional(),
  skillSlug: z.string().trim().min(1).max(120),
  status: z.enum(["ACTIVE", "PAUSED"]).default("ACTIVE"),
});

function buildPrompt(
  skillSlug: string,
  skillTitle: string,
  note: string
): string {
  const task =
    note.trim() ||
    `Review recent changes and update ${skillTitle} if the guidance needs a new revision.`;
  return `Use $${skillSlug} for this task.\n\n${task}`;
}

export async function GET() {
  return withApiUsage(
    { label: "List automations", method: "GET", route: "/api/automations" },
    async () => {
      const catalogue = await getSkillCatalogue();

      return Response.json({
        automations: catalogue.automations,
        ok: true,
      });
    }
  );
}

export async function POST(request: Request) {
  return withApiUsage(
    { label: "Create automation", method: "POST", route: "/api/automations" },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await findSkillAuthorForSession(session);
        const payload = createSchema.parse(await request.json());

        if (payload.status !== "PAUSED") {
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

        const skill = await getSkillRecordBySlug(payload.skillSlug);

        if (!skill) {
          return Response.json(
            { error: "That skill no longer exists." },
            { status: 404 }
          );
        }

        if (!canSessionEditSkill(skill, session, sessionAuthor)) {
          return Response.json(
            {
              error:
                "Only the skill owner can create or trigger automation for this skill.",
            },
            { status: 403 }
          );
        }

        const prompt = buildPrompt(skill.slug, skill.title, payload.note);

        const preferredHour =
          payload.preferredHour !== undefined &&
          isValidCronSlotHour(payload.preferredHour)
            ? payload.preferredHour
            : DEFAULT_PREFERRED_HOUR;
        const preferredDay =
          payload.preferredDay !== undefined &&
          isValidDayOfWeek(payload.preferredDay)
            ? payload.preferredDay
            : DEFAULT_PREFERRED_DAY;

        const automation: SkillAutomationState = {
          cadence: payload.cadence,
          enabled: payload.status !== "PAUSED",
          preferredDay,
          preferredHour,
          prompt,
          status: payload.status === "PAUSED" ? "paused" : "active",
        };

        await updateSkill(skill.slug, {
          automation,
          origin: "user",
        });

        revalidatePath("/");
        revalidatePath("/settings", "layout");
        revalidatePath(`/categories/${skill.category}`);
        revalidatePath(`/skills/${skill.slug}`);

        await logUsageEvent({
          categorySlug: skill.category,
          details: payload.name,
          kind: "automation_create",
          label: "Created automation",
          path: `/skills/${skill.slug}`,
          skillSlug: skill.slug,
          source: "api",
        });

        return Response.json({
          id: skill.slug,
          ok: true,
          prompt,
        });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) {
          return authResp;
        }

        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json(
          { error: "Unable to create automation." },
          { status: 400 }
        );
      }
    }
  );
}
