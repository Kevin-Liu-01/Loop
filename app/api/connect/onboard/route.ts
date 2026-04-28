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

        const message =
          error instanceof Error
            ? error.message
            : "Unable to start onboarding.";
        console.error("[connect/onboard]", message);

        if (
          message.includes("signed up for Connect") ||
          message.includes("not registered as a platform")
        ) {
          return Response.json(
            {
              error:
                "Stripe Connect is not enabled yet. Complete platform setup at dashboard.stripe.com/test/settings/connect first.",
            },
            { status: 400 }
          );
        }

        return Response.json({ error: message }, { status: 400 });
      }
    }
  );
}
