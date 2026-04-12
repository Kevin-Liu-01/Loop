import { NextResponse } from "next/server";

import { createPortalSession } from "@/lib/stripe";
import { withApiUsage } from "@/lib/usage-server";

export async function GET(request: Request) {
  return withApiUsage(
    {
      label: "Create billing portal session",
      method: "GET",
      route: "/api/billing/portal",
    },
    async () => {
      const { searchParams, origin } = new URL(request.url);
      const customerId = searchParams.get("customer");

      if (!customerId) {
        return NextResponse.redirect(
          new URL("/settings/subscription?billing=no-customer", request.url)
        );
      }

      try {
        const portalUrl = await createPortalSession(customerId, origin);
        return NextResponse.redirect(portalUrl);
      } catch {
        return NextResponse.redirect(
          new URL(
            "/settings/subscription?billing=portal-unconfigured",
            request.url
          )
        );
      }
    }
  );
}
