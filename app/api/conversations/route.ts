import { z } from "zod";

import { authErrorResponse, getSessionUser } from "@/lib/auth";
import { listConversations, upsertConversation } from "@/lib/db/conversations";
import { withApiUsage } from "@/lib/usage-server";

const messageMetadataSchema = z.object({
  attachments: z
    .object({
      mcps: z.array(
        z.object({
          iconUrl: z.string().optional(),
          id: z.string(),
          name: z.string(),
          sandboxSupported: z.boolean().optional(),
          transport: z.enum(["stdio", "http", "sse", "ws", "unknown"]),
        })
      ),
      skills: z.array(
        z.object({
          iconUrl: z.string().optional(),
          slug: z.string(),
          title: z.string(),
          versionLabel: z.string(),
        })
      ),
    })
    .optional(),
});

const messagePartSchema = z.discriminatedUnion("type", [
  z.object({ text: z.string(), type: z.literal("text") }),
  z.object({
    toolInvocation: z.object({
      args: z.record(z.unknown()),
      result: z.record(z.unknown()).optional(),
      state: z.string(),
      toolName: z.string(),
    }),
    type: z.literal("tool-invocation"),
  }),
]);

const upsertSchema = z.object({
  channel: z.enum(["copilot", "agent-studio", "sandbox"]),
  id: z.string().uuid().nullable().optional(),
  messages: z.array(
    z.object({
      content: z.string(),
      createdAt: z.string(),
      id: z.string(),
      metadata: messageMetadataSchema.optional(),
      parts: z.array(messagePartSchema).optional(),
      role: z.enum(["user", "assistant", "system"]),
    })
  ),
  model: z.string().optional(),
  providerId: z.string().optional(),
  title: z.string().max(200).default(""),
});

export async function GET(request: Request) {
  return withApiUsage(
    { label: "List conversations", method: "GET", route: "/api/conversations" },
    async () => {
      try {
        const session = await getSessionUser();
        if (!session) {
          return Response.json(
            { error: "Sign in to view conversations." },
            { status: 401 }
          );
        }

        const url = new URL(request.url);
        const channel = url.searchParams.get("channel") as
          | "copilot"
          | "agent-studio"
          | null;
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);

        const conversations = await listConversations(
          session.userId,
          channel ?? undefined,
          limit
        );

        return Response.json({
          conversations: conversations.map(({ messages: _msgs, ...rest }) => ({
            ...rest,
            messageCount: _msgs.length,
          })),
          ok: true,
        });
      } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) {
          return authResponse;
        }
        return Response.json(
          { error: "Failed to list conversations." },
          { status: 500 }
        );
      }
    }
  );
}

export async function POST(request: Request) {
  return withApiUsage(
    { label: "Save conversation", method: "POST", route: "/api/conversations" },
    async () => {
      try {
        const session = await getSessionUser();
        if (!session) {
          return Response.json(
            { error: "Sign in to save conversations." },
            { status: 401 }
          );
        }

        const payload = upsertSchema.parse(await request.json());
        const record = await upsertConversation({
          channel: payload.channel,
          clerkUserId: session.userId,
          id: payload.id ?? undefined,
          messages: payload.messages,
          model: payload.model,
          providerId: payload.providerId,
          title: payload.title,
        });

        return Response.json({ id: record.id, ok: true });
      } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) {
          return authResponse;
        }

        if (error instanceof z.ZodError) {
          return Response.json(
            { error: error.issues[0]?.message ?? "Invalid payload." },
            { status: 400 }
          );
        }

        return Response.json(
          { error: "Failed to save conversation." },
          { status: 500 }
        );
      }
    }
  );
}
