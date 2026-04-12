import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import { getSkillRecordBySlug } from "@/lib/content";
import { findSkillAuthorForSession } from "@/lib/db/skill-authors";
import { createSkill as dbCreateSkill } from "@/lib/db/skills";
import { buildSkillVersionHref } from "@/lib/format";
import { slugify, stableHash } from "@/lib/markdown";
import { buildResearchProfile } from "@/lib/research-profile";
import { buildPausedAutomationFromSource } from "@/lib/skill-fork-helpers";
import { canCreateSkill } from "@/lib/skill-limits";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";

const bodySchema = z.object({
  slug: z.string().min(1).max(120),
});

export async function POST(request: Request) {
  return withApiUsage(
    { label: "Fork skill", method: "POST", route: "/api/skills/fork" },
    async () => {
      try {
        const session = await requireAuth();
        const sessionAuthor = await findSkillAuthorForSession(session);
        const { slug: sourceSlug } = bodySchema.parse(await request.json());

        const limits = await canCreateSkill(session.userId, session.email);
        if (!limits.allowed) {
          return Response.json(
            {
              currentCount: limits.currentCount,
              error: `Free accounts can create up to ${limits.limit} skill${limits.limit === 1 ? "" : "s"}. Upgrade to Operator for unlimited skills.`,
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
          `${slugify(source.title)}-fork` ||
          `skill-${stableHash(source.title)}-fork`;
        let newSlug = baseSlug;
        let attempt = 0;
        while (await getSkillRecordBySlug(newSlug)) {
          attempt++;
          newSlug = `${baseSlug}-${attempt}`;
        }

        const forkSources = source.sources ?? [];
        const researchProfile = buildResearchProfile({
          sources: forkSources,
          title: `${source.title} (Fork)`,
        });

        const created = await dbCreateSkill({
          accent: source.accent,
          agentDocs: source.agentDocs,
          agents: source.agents,
          authorId: sessionAuthor?.id,
          automation: buildPausedAutomationFromSource(source),
          body: source.body,
          category: source.category,
          creatorClerkUserId: session.userId,
          description: source.description,
          forkedFromSlug: sourceSlug,
          iconUrl: source.iconUrl,
          origin: "user",
          ownerName: sessionAuthor?.displayName ?? undefined,
          references: source.references,
          researchProfile,
          slug: newSlug,
          sources: forkSources,
          tags: source.tags,
          title: `${source.title} (Fork)`,
          updates: [],
          version: 1,
          visibility: "private",
        });

        const href = buildSkillVersionHref(newSlug, 1);

        revalidatePath("/");
        revalidatePath(`/skills/${newSlug}`);
        revalidatePath(href);

        await logUsageEvent({
          categorySlug: source.category,
          details: `Forked from ${sourceSlug}`,
          kind: "skill_create",
          label: "Forked skill",
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
          { error: "Unable to fork skill." },
          { status: 400 }
        );
      }
    }
  );
}
