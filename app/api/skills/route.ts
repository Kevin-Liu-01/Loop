import { revalidatePath } from "next/cache";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import { getSkillCatalogue, getSkillRecordBySlug } from "@/lib/content";
import { ensureSkillAuthorForSession } from "@/lib/db/skill-authors";
import { updateSkill } from "@/lib/db/skills";
import { buildResearchProfile } from "@/lib/research-profile";
import { canSessionEditSkill } from "@/lib/skill-authoring";
import { canCreateSkill, recordSkillCreate } from "@/lib/skill-limits";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";
import {
  addUserSkill,
  buildUserSkillRecord,
  createUserSkillDocument,
  createUserSkillInputSchema,
  listUserSkillDocuments,
  saveUserSkillDocuments,
  skillRecordToUserDoc,
  updateUserSkillDocument,
  updateUserSkillInputSchema,
} from "@/lib/user-skills";

export async function GET() {
  return withApiUsage(
    {
      label: "List user skills",
      method: "GET",
      route: "/api/skills",
    },
    async () => {
      try {
        const session = await requireAuth();
        const skills = await listUserSkillDocuments();
        const ownSkills = skills.filter(
          (skill) => skill.creatorClerkUserId === session.userId
        );

        return Response.json({
          count: ownSkills.length,
          ok: true,
          skills: ownSkills.map((skill) => ({
            automation: skill.automation,
            category: skill.category,
            ownerName: skill.ownerName ?? null,
            slug: skill.slug,
            title: skill.title,
            updatedAt: skill.updatedAt,
          })),
        });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) {
          return authResp;
        }

        return Response.json(
          { error: "Unable to list skills." },
          { status: 400 }
        );
      }
    }
  );
}

export async function POST(request: Request) {
  return withApiUsage(
    {
      label: "Create skill",
      method: "POST",
      route: "/api/skills",
    },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await ensureSkillAuthorForSession(session);
        const payload = createUserSkillInputSchema.parse(await request.json());
        const limits = await canCreateSkill(session.userId, session.email);
        if (!limits.allowed) {
          return Response.json(
            {
              currentCount: limits.currentCount,
              error: limits.reason ?? "Skill limit reached.",
              isOperator: limits.isOperator,
              limit: limits.limit,
            },
            { status: 403 }
          );
        }
        const draft = createUserSkillDocument(payload);
        const catalogue = await getSkillCatalogue();

        if (catalogue.skills.some((skill) => skill.slug === draft.slug)) {
          return Response.json(
            {
              error: `The slug "${draft.slug}" is already taken. Rename the skill title and try again.`,
            },
            { status: 409 }
          );
        }

        const created = await addUserSkill(payload, {
          authorId: sessionAuthor.id,
          creatorClerkUserId: session.userId,
          ownerName: sessionAuthor.displayName ?? payload.ownerName,
        });
        recordSkillCreate(session.userId);
        const createdRecord = buildUserSkillRecord(created);

        const researchProfile = buildResearchProfile({
          sources: created.sources,
          title: created.title,
        });
        await updateSkill(created.slug, { researchProfile }).catch(() => {});

        revalidatePath("/");
        revalidatePath("/skills/new");
        revalidatePath(`/categories/${created.category}`);
        revalidatePath(`/skills/${created.slug}`);
        revalidatePath(createdRecord.href);

        await logUsageEvent({
          categorySlug: created.category,
          details: created.title,
          kind: "skill_create",
          label: "Created skill",
          path: createdRecord.href,
          skillSlug: created.slug,
          source: "api",
        });

        return Response.json({
          href: createdRecord.href,
          ok: true,
          slug: created.slug,
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
          { error: "Unable to create skill." },
          { status: 400 }
        );
      }
    }
  );
}

export async function PATCH(request: Request) {
  return withApiUsage(
    {
      label: "Save skill setup",
      method: "PATCH",
      route: "/api/skills",
    },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await ensureSkillAuthorForSession(session);
        const payload = updateUserSkillInputSchema.parse(await request.json());
        const current = await getSkillRecordBySlug(payload.slug);

        if (!current) {
          return Response.json(
            { error: "That tracked skill could not be found." },
            { status: 404 }
          );
        }

        if (!canSessionEditSkill(current, session, sessionAuthor)) {
          return Response.json(
            { error: "Only the skill author or an admin can edit this skill." },
            { status: 403 }
          );
        }

        const result = updateUserSkillDocument(
          skillRecordToUserDoc(current),
          payload
        );
        if (result.changed) {
          await saveUserSkillDocuments([result.skill]);

          const researchProfile = buildResearchProfile({
            sources: result.skill.sources,
            title: result.skill.title,
          });
          await updateSkill(result.skill.slug, { researchProfile }).catch(
            () => {}
          );
        }

        const record = buildUserSkillRecord(result.skill);

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/skills/new");
        revalidatePath(`/categories/${current.category}`);
        revalidatePath(`/categories/${result.skill.category}`);
        revalidatePath(`/skills/${current.slug}`);
        revalidatePath(record.href);

        await logUsageEvent({
          categorySlug: result.skill.category,
          details: result.changed ? `Saved ${record.href}` : "No setup change",
          kind: "skill_save",
          label: result.changed ? "Saved skill setup" : "Checked skill setup",
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
