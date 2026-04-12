import { authErrorResponse, getSessionUser } from "@/lib/auth";
import { deleteConversation, getConversation } from "@/lib/db/conversations";
import { withApiUsage } from "@/lib/usage-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  return withApiUsage(
    {
      label: "Get conversation",
      method: "GET",
      route: "/api/conversations/[id]",
    },
    async () => {
      try {
        const session = await getSessionUser();
        if (!session) {
          return Response.json(
            { error: "Sign in to view conversations." },
            { status: 401 }
          );
        }

        const { id } = await context.params;
        const record = await getConversation(id, session.userId);

        if (!record) {
          return Response.json(
            { error: "Conversation not found." },
            { status: 404 }
          );
        }

        return Response.json({ conversation: record, ok: true });
      } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) {
          return authResponse;
        }
        return Response.json(
          { error: "Failed to load conversation." },
          { status: 500 }
        );
      }
    }
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withApiUsage(
    {
      label: "Delete conversation",
      method: "DELETE",
      route: "/api/conversations/[id]",
    },
    async () => {
      try {
        const session = await getSessionUser();
        if (!session) {
          return Response.json(
            { error: "Sign in to delete conversations." },
            { status: 401 }
          );
        }

        const { id } = await context.params;
        await deleteConversation(id, session.userId);
        return Response.json({ ok: true });
      } catch (error) {
        const authResponse = authErrorResponse(error);
        if (authResponse) {
          return authResponse;
        }
        return Response.json(
          { error: "Failed to delete conversation." },
          { status: 500 }
        );
      }
    }
  );
}
