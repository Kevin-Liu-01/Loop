import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import { getSkillRecordBySlug } from "@/lib/content";
import { ensureSkillAuthorForSession } from "@/lib/db/skill-authors";
import { createSkill as dbCreateSkill } from "@/lib/db/skills";
import { buildSkillVersionHref, buildVersionLabel } from "@/lib/format";
import { slugify, stableHash } from "@/lib/markdown";
import { buildPausedAutomationFromSource } from "@/lib/skill-fork-helpers";
import {
  canCreateSkill,
  recordSkillCreate,
  MAX_SLUG_COLLISION_ATTEMPTS,
} from "@/lib/skill-limits";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";
import { clampField, SKILL_TITLE_MAX_LENGTH } from "@/lib/user-skills";

const bodySchema = z.object({
  slug: z.string().min(1).max(120),
});

export async function POST(request: Request) {
  return withApiUsage(
    { label: "Copy skill", method: "POST", route: "/api/skills/copy" },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await ensureSkillAuthorForSession(session);
        const { slug: sourceSlug } = bodySchema.parse(await request.json());

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

        const source = await getSkillRecordBySlug(sourceSlug);
        if (!source) {
          return Response.json(
            { error: "Source skill not found." },
            { status: 404 }
          );
        }

        const baseSlug =
          `${slugify(source.title)}-copy` ||
          `skill-${stableHash(source.title)}-copy`;
        let newSlug = baseSlug;
        let attempt = 0;
        while (await getSkillRecordBySlug(newSlug)) {
          attempt++;
          if (attempt > MAX_SLUG_COLLISION_ATTEMPTS) {
            return Response.json(
              {
                error:
                  "Too many copies with similar names. Try a different skill or rename an existing copy.",
              },
              { status: 409 }
            );
          }
          newSlug = `${baseSlug}-${attempt}`;
        }

        const created = await dbCreateSkill({
          accent: source.accent,
          agentDocs: source.agentDocs,
          agents: source.agents,
          authorId: sessionAuthor.id,
          automation: buildPausedAutomationFromSource(source),
          body: source.body,
          category: source.category,
          creatorClerkUserId: session.userId,
          description: source.description,
          forkedFromSlug: sourceSlug,
          iconUrl: source.iconUrl,
          origin: "user",
          ownerName: sessionAuthor.displayName,
          references: source.references,
          slug: newSlug,
          sources: source.sources ?? [],
          tags: source.tags,
          title: clampField(`${source.title} (Copy)`, SKILL_TITLE_MAX_LENGTH),
          updates: [],
          version: 1,
          visibility: "private",
        });

        const href = buildSkillVersionHref(newSlug, 1);
        recordSkillCreate(session.userId);

        revalidatePath("/");
        revalidatePath(`/skills/${newSlug}`);
        revalidatePath(href);

        await logUsageEvent({
          categorySlug: source.category,
          details: `Forked from ${sourceSlug}`,
          kind: "skill_create",
          label: "Copied skill",
          path: href,
          skillSlug: newSlug,
          source: "api",
        });

        return Response.json({
          forkedFrom: sourceSlug,
          href,
          ok: true,
          slug: newSlug,
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
          { error: "Unable to copy skill." },
          { status: 400 }
        );
      }
    }
  );
}
