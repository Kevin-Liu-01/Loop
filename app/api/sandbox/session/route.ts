import { z } from "zod";

import {
  createSandboxSession,
  getSandboxStatus,
  stopSandboxSession,
} from "@/lib/sandbox";
import type { SandboxRuntime } from "@/lib/sandbox";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";

const createSchema = z.object({
  env: z.record(z.string(), z.string()).optional(),
  runtime: z.enum(["node24", "node22", "python3.13"]).default("node24"),
});

export async function POST(request: Request) {
  return withApiUsage(
    { label: "Create sandbox", method: "POST", route: "/api/sandbox/session" },
    async () => {
      try {
        const payload = createSchema.parse(await request.json());
        const session = await createSandboxSession(
          payload.runtime as SandboxRuntime,
          payload.env
        );

        await logUsageEvent({
          details: `${session.runtime} / ${session.sandboxId}`,
          kind: "api_call",
          label: "Created sandbox session",
          source: "api",
        });

        return Response.json(session, { status: 201 });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create sandbox";

        try {
          const parsed = JSON.parse(message);
          if (parsed.code === "SANDBOX_AUTH_FAILED") {
            return Response.json(parsed, { status: 403 });
          }
        } catch {
          /* not a structured error */
        }

        return Response.json({ error: message }, { status: 400 });
      }
    }
  );
}

export async function GET(request: Request) {
  return withApiUsage(
    {
      label: "Get sandbox status",
      method: "GET",
      route: "/api/sandbox/session",
    },
    async () => {
      const { searchParams } = new URL(request.url);
      const sandboxId = searchParams.get("sandboxId");

      if (!sandboxId) {
        return Response.json(
          { error: "sandboxId query param required" },
          { status: 400 }
        );
      }

      const status = await getSandboxStatus(sandboxId);
      if (!status) {
        return Response.json({ error: "Sandbox not found" }, { status: 404 });
      }

      return Response.json(status);
    }
  );
}

export async function DELETE(request: Request) {
  return withApiUsage(
    {
      label: "Stop sandbox",
      method: "DELETE",
      route: "/api/sandbox/session",
    },
    async () => {
      const { searchParams } = new URL(request.url);
      const sandboxId = searchParams.get("sandboxId");

      if (!sandboxId) {
        return Response.json(
          { error: "sandboxId query param required" },
          { status: 400 }
        );
      }

      await stopSandboxSession(sandboxId);

      logUsageEvent({
        details: sandboxId,
        kind: "api_call",
        label: "Stopped sandbox session",
        source: "api",
      }).catch(() => {});

      return Response.json({ ok: true });
    }
  );
}
