import { authErrorResponse, requireActiveSubscription } from "@/lib/auth";
import { createConnectAccount, createOnboardingLink } from "@/lib/connect";
import { withApiUsage } from "@/lib/usage-server";

export async function POST(request: Request) {
  return withApiUsage(
    {
      label: "Start Stripe Connect onboarding",
      method: "POST",
      route: "/api/connect/onboard",
    },
    async () => {
      try {
        const session = await requireActiveSubscription();
        const { origin } = new URL(request.url);

        let accountId = session.stripeConnectAccountId;
        if (!accountId) {
          const account = await createConnectAccount(
            session.userId,
            session.email
          );
          accountId = account.id;
        }

        const onboardingUrl = await createOnboardingLink(accountId, origin);
        return Response.json({ ok: true, url: onboardingUrl });
      } catch (error) {
        const authResp = authErrorResponse(error);
        if (authResp) {
          return authResp;
        }

        if (error instanceof Error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json(
          { error: "Unable to start onboarding." },
          { status: 400 }
        );
      }
    }
  );
}
