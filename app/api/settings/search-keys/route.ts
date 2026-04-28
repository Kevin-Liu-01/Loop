import { z } from "zod";

import {
  getUserSearchKeys,
  maskUserSearchKeys,
  setUserSearchKeys,
} from "@/lib/agent-tools/user-search-keys";
import { authErrorResponse, requireAuth } from "@/lib/auth";

const putSchema = z.object({
  provider: z.enum(["brave", "firecrawl", "serper", "tavily", "jina"]),
  firecrawl: z.string().optional(),
  serper: z.string().optional(),
  tavily: z.string().optional(),
  jina: z.string().optional(),
});

export async function GET() {
  try {
    const session = await requireAuth();
    const keys = await getUserSearchKeys(session.userId);
    return Response.json({ ok: true, searchKeys: maskUserSearchKeys(keys) });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }
    return Response.json(
      { error: "Failed to load search keys." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();
    const body = putSchema.parse(await request.json());

    const existing = (await getUserSearchKeys(session.userId)) ?? {};

    const merged = {
      provider: body.provider,
      firecrawl: body.firecrawl ?? existing.firecrawl,
      serper: body.serper ?? existing.serper,
      tavily: body.tavily ?? existing.tavily,
      jina: body.jina ?? existing.jina,
    };

    if (body.provider !== "brave") {
      const key = merged[body.provider];
      if (!key) {
        return Response.json(
          {
            error: `An API key is required for ${body.provider}. Enter your key or switch to Brave Search (free).`,
          },
          { status: 400 }
        );
      }
    }

    await setUserSearchKeys(session.userId, merged);

    const updated = await getUserSearchKeys(session.userId);
    return Response.json({ ok: true, searchKeys: maskUserSearchKeys(updated) });
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
      { error: "Failed to save search keys." },
      { status: 500 }
    );
  }
}
