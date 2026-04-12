import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  buildImportedSkillRecord,
  importRemoteMcps,
  importRemoteSkill,
  listImportedMcps,
  listImportedSkills,
} from "@/lib/imports";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";

const importSchema = z.object({
  kind: z.enum(["skill", "mcp"]),
  sourceIconUrl: z.string().url().optional(),
  sourceName: z.string().optional(),
  url: z.string().url(),
});

export async function GET() {
  return withApiUsage(
    {
      label: "List imports",
      method: "GET",
      route: "/api/imports",
    },
    async () => {
      const [skills, mcps] = await Promise.all([
        listImportedSkills(),
        listImportedMcps(),
      ]);

      return Response.json({
        mcps,
        ok: true,
        skills,
      });
    }
  );
}

export async function POST(request: Request) {
  return withApiUsage(
    {
      label: "Import remote asset",
      method: "POST",
      route: "/api/imports",
    },
    async () => {
      try {
        const payload = importSchema.parse(await request.json());

        if (payload.kind === "skill") {
          const skill = await importRemoteSkill(payload.url, {
            sourceIconUrl: payload.sourceIconUrl,
            sourceName: payload.sourceName,
          });
          const record = buildImportedSkillRecord(skill);

          revalidatePath("/");
          revalidatePath("/agents");
          revalidatePath(`/categories/${skill.category}`);
          revalidatePath(`/skills/${skill.slug}`);
          revalidatePath(record.href);

          await logUsageEvent({
            categorySlug: skill.category,
            details: payload.url,
            kind: "skill_import",
            label: "Imported skill",
            path: record.href,
            skillSlug: skill.slug,
            source: "api",
          });

          return Response.json({
            kind: "skill",
            ok: true,
            skill,
          });
        }

        const mcps = await importRemoteMcps(payload.url);

        revalidatePath("/");
        revalidatePath("/agents");

        return Response.json({
          kind: "mcp",
          mcps,
          ok: true,
        });
      } catch (error) {
        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ error: "Import failed." }, { status: 400 });
      }
    }
  );
}
