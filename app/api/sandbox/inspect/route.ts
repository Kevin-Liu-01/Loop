import { z } from "zod";

import { getSandboxInstance } from "@/lib/sandbox";
import { inspectSandbox } from "@/lib/sandbox-inspect";
import { withApiUsage } from "@/lib/usage-server";

const inspectSchema = z.object({
  path: z.string().optional(),
  runtime: z.string().default("node24"),
  sandboxId: z.string().min(1),
});

export async function POST(request: Request) {
  return withApiUsage(
    { label: "Inspect sandbox", method: "POST", route: "/api/sandbox/inspect" },
    async () => {
      try {
        const payload = inspectSchema.parse(await request.json());
        const sandbox = await getSandboxInstance(payload.sandboxId);
        const data = await inspectSandbox(
          sandbox,
          payload.sandboxId,
          payload.runtime,
          payload.path
        );
        return Response.json(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to inspect sandbox";
        return Response.json({ error: message }, { status: 400 });
      }
    }
  );
}
