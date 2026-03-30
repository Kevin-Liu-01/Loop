import { authErrorResponse, requireAuth } from "@/lib/auth";
import { getConnectAccountStatus } from "@/lib/connect";
import { withApiUsage } from "@/lib/usage-server";

export async function GET() {
  return withApiUsage(
    {
      route: "/api/connect/status",
      method: "GET",
      label: "Check Connect account status"
    },
    async () => {
      try {
        const session = await requireAuth();

        if (!session.stripeConnectAccountId) {
          return Response.json({
            ok: true,
            connected: false,
            ready: false,
            detailsSubmitted: false,
            chargesEnabled: false
          });
        }

        const status = await getConnectAccountStatus(session.stripeConnectAccountId);
        return Response.json({
          ok: true,
          connected: true,
          ...status
        });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) return authResp;

        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ error: "Unable to check status." }, { status: 400 });
      }
    }
  );
}
