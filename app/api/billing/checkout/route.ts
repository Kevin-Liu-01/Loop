import { NextResponse } from "next/server";

import { authErrorResponse, requireAuth } from "@/lib/auth";
import { getPaidPlans, createCheckoutSession } from "@/lib/stripe";
import { withApiUsage } from "@/lib/usage-server";

export async function GET(request: Request) {
  return withApiUsage(
    {
      route: "/api/billing/checkout",
      method: "GET",
      label: "Create checkout session"
    },
    async () => {
      let session;
      try {
        session = await requireAuth();
      } catch (error) {
        return authErrorResponse(error) ?? Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { searchParams, origin } = new URL(request.url);
      const plan = searchParams.get("plan");
      const allowedPlans = new Set(getPaidPlans().map((entry) => entry.slug));

      if (!plan || !allowedPlans.has(plan)) {
        return NextResponse.redirect(new URL("/?billing=unknown-plan", request.url));
      }

      try {
        const checkoutUrl = await createCheckoutSession(plan, origin, session.userId);
        return NextResponse.redirect(checkoutUrl);
      } catch {
        return NextResponse.redirect(new URL("/?billing=unconfigured", request.url));
      }
    }
  );
}
