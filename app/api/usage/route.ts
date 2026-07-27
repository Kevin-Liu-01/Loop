import { after } from "next/server";
import { z } from "zod";

import { logUsageEvent } from "@/lib/usage-server";

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
  const payload = usageSchema.parse(await request.json());

  after(() =>
    logUsageEvent({
      ...payload,
      source: "ui",
    })
  );

  return new Response(null, { status: 204 });
}
