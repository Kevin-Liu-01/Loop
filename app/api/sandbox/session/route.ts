import { z } from "zod";

import { authErrorResponse, requireActiveSubscription } from "@/lib/auth";
import {
  countActiveSandboxSessions,
  recordSandboxOwnership,
  updateSandboxOwnershipStatus,
} from "@/lib/db/sandbox-sessions";
import {
  createSandboxSession,
  getSandboxStatus,
  SANDBOX_TIMEOUT_MS,
  stopSandboxSession,
} from "@/lib/sandbox";
import type { SandboxRuntime } from "@/lib/sandbox";
import { requireSandboxOwner } from "@/lib/sandbox-access";
import { withApiUsage } from "@/lib/usage-server";

const createSchema = z.object({
  env: z.record(z.string(), z.string()).optional(),
  runtime: z.enum(["node24", "node22", "python3.13"]).default("node24"),
});

export const MAX_ACTIVE_SANDBOXES_PER_USER = 1;

export async function POST(request: Request) {
  return withApiUsage(
    { label: "Create sandbox", method: "POST", route: "/api/sandbox/session" },
    async () => {
      try {
        const actor = await requireActiveSubscription();
        const payload = createSchema.parse(await request.json());
        const activeSessionCount = await countActiveSandboxSessions(
          actor.userId
        );
        if (activeSessionCount >= MAX_ACTIVE_SANDBOXES_PER_USER) {
          return Response.json(
            { error: "Stop your active sandbox before creating another." },
            { status: 429 }
          );
        }

        const session = await createSandboxSession(
          payload.runtime as SandboxRuntime,
          payload.env
        );
        try {
          await recordSandboxOwnership({
            clerkUserId: actor.userId,
            expiresAt: new Date(Date.now() + SANDBOX_TIMEOUT_MS).toISOString(),
            runtime: session.runtime,
            sandboxId: session.sandboxId,
            status: session.status,
          });
        } catch (ownershipError) {
          await stopSandboxSession(session.sandboxId);
          throw ownershipError;
        }

        return Response.json(session, { status: 201 });
      } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) {
          return authResponse;
        }
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
      try {
        const { searchParams } = new URL(request.url);
        const sandboxId = searchParams.get("sandboxId");

        if (!sandboxId) {
          return Response.json(
            { error: "sandboxId query param required" },
            { status: 400 }
          );
        }

        await requireSandboxOwner(sandboxId);
        const status = await getSandboxStatus(sandboxId);
        if (!status) {
          return Response.json({ error: "Sandbox not found" }, { status: 404 });
        }
        await updateSandboxOwnershipStatus(sandboxId, status.status);
        return Response.json(status);
      } catch (error) {
        return (
          authErrorResponse(error) ??
          Response.json(
            { error: "Unable to read sandbox status." },
            { status: 500 }
          )
        );
      }
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
      try {
        const { searchParams } = new URL(request.url);
        const sandboxId = searchParams.get("sandboxId");

        if (!sandboxId) {
          return Response.json(
            { error: "sandboxId query param required" },
            { status: 400 }
          );
        }

        await requireSandboxOwner(sandboxId);
        await stopSandboxSession(sandboxId);
        await updateSandboxOwnershipStatus(sandboxId, "stopped");
        return Response.json({ ok: true });
      } catch (error) {
        return (
          authErrorResponse(error) ??
          Response.json({ error: "Unable to stop sandbox." }, { status: 500 })
        );
      }
    }
  );
}
