import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import { getSkillRecordBySlug } from "@/lib/content";
import { ensureSkillAuthorForSession } from "@/lib/db/skill-authors";
import { updateSkill } from "@/lib/db/skills";
import { canSessionEditSkill } from "@/lib/skill-authoring";
import { canMakeSkillPublic } from "@/lib/skill-limits";
import { withApiUsage } from "@/lib/usage-server";

const patchSchema = z.object({
  visibility: z.enum(["public", "private"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withApiUsage(
    {
      label: "Update skill visibility",
      method: "PATCH",
      route: "/api/skills/[slug]/visibility",
    },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await ensureSkillAuthorForSession(session);
        const { slug } = await params;
        const skill = await getSkillRecordBySlug(slug);

        if (!skill) {
          return Response.json({ error: "Skill not found." }, { status: 404 });
        }

        if (!canSessionEditSkill(skill, session, sessionAuthor)) {
          return Response.json(
            { error: "Only the skill owner can change visibility." },
            { status: 403 }
          );
        }

        const { visibility } = patchSchema.parse(await request.json());

        if (visibility === "public" && skill.visibility !== "public") {
          const pubLimits = await canMakeSkillPublic(
            session.userId,
            session.email
          );
          if (!pubLimits.allowed) {
            return Response.json(
              {
                error: pubLimits.reason,
                limit: pubLimits.limit,
                publicCount: pubLimits.publicCount,
              },
              { status: 403 }
            );
          }
        }

        await updateSkill(slug, { visibility });

        revalidatePath("/");
        revalidatePath(`/skills/${slug}`);
        revalidatePath("/settings", "layout");

        return Response.json({ ok: true, slug, visibility });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) {
          return authResp;
        }

        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json(
          { error: "Unable to update visibility." },
          { status: 400 }
        );
      }
    }
  );
}
