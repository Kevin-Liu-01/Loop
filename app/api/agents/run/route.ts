import { stepCountIs, streamText } from "ai";
import { z } from "zod";

import { buildAgentContext, resolveLanguageModel } from "@/lib/agents";
import { authErrorResponse, getSessionUser } from "@/lib/auth";
import { buildMcpToolRuntime } from "@/lib/mcp-runtime";
import { getLoopSnapshot } from "@/lib/refresh";
import { canRunAgentMessage, recordAgentRun } from "@/lib/skill-limits";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";

const runSchema = z.object({
  agentName: z.string().optional(),
  apiKeyEnvVar: z.string().optional(),
  compatibleBaseUrl: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  messages: z.array(z.any()),
  model: z.string().min(1),
  providerId: z.string().min(1),
  selectedMcpIds: z.array(z.string()).optional(),
  selectedSkillSlugs: z.array(z.string()).optional(),
  systemPrompt: z.string().optional(),
});

export async function POST(request: Request) {
  return withApiUsage(
    {
      label: "Agent run",
      method: "POST",
      route: "/api/agents/run",
    },
    async () => {
      try {
        const session = await getSessionUser();
        if (!session) {
          return Response.json(
            { error: "Sign in to use the agent." },
            { status: 401 }
          );
        }

        const gate = await canRunAgentMessage(session.userId, session.email);
        if (!gate.allowed) {
          return Response.json(
            { error: gate.reason ?? "Daily agent run limit reached." },
            { status: 429 }
          );
        }

        const payload = runSchema.parse(await request.json());
        const snapshot = await getLoopSnapshot();
        const model = resolveLanguageModel(payload);
        const selectedMcps =
          payload.selectedMcpIds && payload.selectedMcpIds.length > 0
            ? snapshot.mcps.filter((mcp) =>
                payload.selectedMcpIds?.includes(mcp.id)
              )
            : [];
        const mcpRuntime = await buildMcpToolRuntime(selectedMcps);
        const toolContext =
          mcpRuntime.catalog.length > 0
            ? [
                "Executable MCP tools:",
                ...mcpRuntime.catalog.map(
                  (tool) =>
                    `- ${tool.toolKey} -> ${tool.serverName}/${tool.toolName}: ${tool.description}`
                ),
              ].join("\n")
            : "Executable MCP tools: none.";
        const warningContext =
          mcpRuntime.warnings.length > 0
            ? `\n\nMCP runtime warnings:\n- ${mcpRuntime.warnings.join("\n- ")}`
            : "";
        const system = `${buildAgentContext(snapshot, payload)}\n\n${toolContext}${warningContext}`;

        await logUsageEvent({
          details: `${payload.providerId} · ${payload.model}`,
          kind: "agent_run",
          label: "Ran agent",
          source: "api",
        });
        recordAgentRun(session.userId);

        const result = streamText({
          messages: payload.messages,
          model,
          onFinish: async () => {
            await mcpRuntime.close();
          },
          stopWhen: stepCountIs(mcpRuntime.catalog.length > 0 ? 5 : 1),
          system,
          tools: mcpRuntime.tools,
        });

        return result.toUIMessageStreamResponse();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to run agent.";
        return Response.json({ error: message }, { status: 400 });
      }
    }
  );
}
