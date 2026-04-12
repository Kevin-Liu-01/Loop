import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import { getSkillCatalogue } from "@/lib/content";
import { updateSkill } from "@/lib/db/skills";
import { buildResearchProfile } from "@/lib/research-profile";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";
import {
  addTrackedSkillFromRecord,
  buildUserSkillRecord,
  normalizeSource,
} from "@/lib/user-skills";

const bodySchema = z.object({
  slug: z.string().min(1),
});

export async function POST(request: Request) {
  return withApiUsage(
    {
      label: "Track skill",
      method: "POST",
      route: "/api/skills/track",
    },
    async () => {
      try {
        await requireAuth();
        const payload = bodySchema.parse(await request.json());
        const base = await getSkillCatalogue();
        const skill = base.skills.find((entry) => entry.slug === payload.slug);

        if (!skill) {
          return Response.json(
            { error: "That skill could not be found." },
            { status: 404 }
          );
        }

        if (skill.origin === "user") {
          return Response.json({
            created: false,
            href: skill.href,
            ok: true,
            slug: skill.slug,
          });
        }

        const skillSources = skill.sources ?? [];
        const hasOwnSources = skillSources.length > 0;
        const sourcesToTrack = hasOwnSources
          ? skillSources
          : skill.path && skill.path.startsWith("http")
            ? [normalizeSource(skill.path, skill.category)]
            : [];
        const tracked = await addTrackedSkillFromRecord(skill, sourcesToTrack);
        const record = buildUserSkillRecord(tracked);

        const researchProfile = buildResearchProfile({
          sources: tracked.sources,
          title: tracked.title,
        });
        await updateSkill(tracked.slug, { researchProfile }).catch(() => {});

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/skills/new");
        revalidatePath(`/categories/${tracked.category}`);
        revalidatePath(`/skills/${tracked.slug}`);
        revalidatePath(record.href);

        await logUsageEvent({
          categorySlug: tracked.category,
          details: tracked.title,
          kind: "skill_track",
          label: "Tracked skill",
          path: record.href,
          skillSlug: tracked.slug,
          source: "api",
        });

        return Response.json({
          created: true,
          href: record.href,
          ok: true,
          slug: tracked.slug,
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
          { error: "Unable to make this skill updateable." },
          { status: 400 }
        );
      }
    }
  );
}
