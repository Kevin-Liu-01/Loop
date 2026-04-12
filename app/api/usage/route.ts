import { z } from "zod";

import { logUsageEvent, withApiUsage } from "@/lib/usage-server";

const usageSchema = z.object({
  categorySlug: z
    .enum([
      "frontend",
      "seo-geo",
      "social",
      "infra",
      "containers",
      "a2a",
      "security",
      "ops",
    ])
    .optional(),
  details: z.string().max(240).optional(),
  kind: z.enum([
    "page_view",
    "copy_prompt",
    "copy_url",
    "search",
    "skill_create",
    "skill_import",
    "skill_track",
    "skill_save",
    "skill_refresh",
    "automation_create",
    "agent_run",
  ]),
  label: z.string().min(1).max(120),
  path: z.string().optional(),
  skillSlug: z.string().optional(),
});

export async function POST(request: Request) {
  return withApiUsage(
    {
      label: "Usage event",
      method: "POST",
      route: "/api/usage",
    },
    async () => {
      const payload = usageSchema.parse(await request.json());

      await logUsageEvent({
        ...payload,
        source: "ui",
      });

      return Response.json({ ok: true });
    }
  );
}
