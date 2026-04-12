import { z } from "zod";

import { resolveLanguageModel } from "@/lib/agents";
import { authErrorResponse, getSessionUser } from "@/lib/auth";
import { generateConversationTitle } from "@/lib/generate-title";
import { withApiUsage } from "@/lib/usage-server";

const bodySchema = z.object({
  apiKeyEnvVar: z.string().optional(),
  compatibleBaseUrl: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  messages: z
    .array(
      z.object({
        content: z.string(),
        role: z.string(),
      })
    )
    .min(1)
    .max(10),
  model: z.string().optional(),
  providerId: z.string().optional(),
});

export async function POST(request: Request) {
  return withApiUsage(
    {
      label: "Generate conversation title",
      method: "POST",
      route: "/api/conversations/title",
    },
    async () => {
      try {
        const session = await getSessionUser();
        if (!session) {
          return Response.json({ error: "Sign in required." }, { status: 401 });
        }

        const payload = bodySchema.parse(await request.json());

        let externalModel;
        if (payload.providerId && payload.model) {
          try {
            externalModel = resolveLanguageModel({
              apiKeyEnvVar: payload.apiKeyEnvVar,
              compatibleBaseUrl: payload.compatibleBaseUrl,
              headers: payload.headers,
              model: payload.model,
              providerId: payload.providerId,
            });
          } catch {
            /* fall through to gateway/fallback */
          }
        }

        const title = await generateConversationTitle(
          payload.messages,
          externalModel
        );

        return Response.json({ ok: true, title });
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
          { error: "Failed to generate title." },
          { status: 500 }
        );
      }
    }
  );
}
