import { z } from "zod";

import { getSandboxInstance } from "@/lib/sandbox";
import { inspectSandbox } from "@/lib/sandbox-inspect";
import { withApiUsage } from "@/lib/usage-server";

const inspectSchema = z.object({
  sandboxId: z.string().min(1),
  runtime: z.string().default("node24"),
  path: z.string().optional(),
});

export async function POST(request: Request) {
  return withApiUsage(
    { route: "/api/sandbox/inspect", method: "POST", label: "Inspect sandbox" },
    async () => {
      try {
        const payload = inspectSchema.parse(await request.json());
        const sandbox = await getSandboxInstance(payload.sandboxId);
        const data = await inspectSandbox(
          sandbox,
          payload.sandboxId,
          payload.runtime,
          payload.path,
        );
        return Response.json(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to inspect sandbox";
        return Response.json({ error: message }, { status: 400 });
      }
    },
  );
}
