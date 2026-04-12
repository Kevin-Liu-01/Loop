import { AGENT_PROVIDER_PRESETS, listGatewayModels } from "@/lib/agents";
import { withApiUsage } from "@/lib/usage-server";

export async function GET() {
  return withApiUsage(
    {
      label: "List models",
      method: "GET",
      route: "/api/models",
    },
    async () => {
      const gatewayModels = await listGatewayModels();

      return Response.json({
        gatewayModels,
        ok: true,
        presets: AGENT_PROVIDER_PRESETS,
      });
    }
  );
}
