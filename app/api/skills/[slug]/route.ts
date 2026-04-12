import { revalidatePath } from "next/cache";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import { getSkillRecordBySlug } from "@/lib/content";
import { findSkillAuthorForSession } from "@/lib/db/skill-authors";
import { deleteSkill } from "@/lib/db/skills";
import { canSessionEditSkill } from "@/lib/skill-authoring";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";
import {
  buildUserSkillRecord,
  saveUserSkillDocuments,
  skillRecordToUserDoc,
  updateUserSkillDocument,
  updateUserSkillInputSchema,
} from "@/lib/user-skills";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withApiUsage(
    {
      label: "Author edit skill",
      method: "PATCH",
      route: "/api/skills/[slug]",
    },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await findSkillAuthorForSession(session);
        const { slug } = await params;
        const skill = await getSkillRecordBySlug(slug);

        if (!skill) {
          return Response.json({ error: "Skill not found." }, { status: 404 });
        }

        if (!canSessionEditSkill(skill, session, sessionAuthor)) {
          return Response.json(
            { error: "Only the skill author or an admin can edit this skill." },
            { status: 403 }
          );
        }

        const payload = updateUserSkillInputSchema.parse({
          ...(await request.json()),
          slug,
        });

        const result = updateUserSkillDocument(
          skillRecordToUserDoc(skill),
          payload
        );
        if (result.changed) {
          await saveUserSkillDocuments([result.skill]);
        }

        const record = buildUserSkillRecord(result.skill);

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/skills/new");
        revalidatePath(`/categories/${skill.category}`);
        revalidatePath(`/categories/${result.skill.category}`);
        revalidatePath(`/skills/${slug}`);
        revalidatePath(record.href);

        await logUsageEvent({
          categorySlug: result.skill.category,
          details: result.changed ? `Saved ${record.href}` : "No setup change",
          kind: "skill_save",
          label: result.changed
            ? "Edited published skill"
            : "Checked published skill",
          path: record.href,
          skillSlug: result.skill.slug,
          source: "api",
        });

        return Response.json({
          changed: result.changed,
          href: record.href,
          ok: true,
          slug: result.skill.slug,
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
          { error: "Unable to update skill." },
          { status: 400 }
        );
      }
    }
  );
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withApiUsage(
    {
      label: "Delete skill",
      method: "DELETE",
      route: "/api/skills/[slug]",
    },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await findSkillAuthorForSession(session);
        const { slug } = await params;
        const skill = await getSkillRecordBySlug(slug);

        if (!skill) {
          return Response.json({ error: "Skill not found." }, { status: 404 });
        }

        if (!canSessionEditSkill(skill, session, sessionAuthor)) {
          return Response.json(
            {
              error: "Only the skill author or an admin can delete this skill.",
            },
            { status: 403 }
          );
        }

        await deleteSkill(slug);

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/skills/new");
        revalidatePath(`/categories/${skill.category}`);
        revalidatePath(`/skills/${slug}`);
        revalidatePath(skill.href);

        await logUsageEvent({
          categorySlug: skill.category,
          details: `Deleted ${skill.title}`,
          kind: "skill_delete",
          label: "Deleted skill",
          path: skill.href,
          skillSlug: slug,
          source: "api",
        });

        return Response.json({ ok: true, slug });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) {
          return authResp;
        }

        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json(
          { error: "Unable to delete skill." },
          { status: 400 }
        );
      }
    }
  );
}
