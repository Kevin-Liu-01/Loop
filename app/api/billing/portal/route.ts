import { NextResponse } from "next/server";

import {
  authErrorResponse,
  getLatestUserSubscription,
  requireAuth,
} from "@/lib/auth";
import { resolveBillingPortalCustomer } from "@/lib/billing-portal";
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
      const requestedCustomerId = searchParams.get("customer");

      let session;
      try {
        session = await requireAuth();
      } catch (error) {
        return (
          authErrorResponse(error) ??
          Response.json({ error: "Unauthorized" }, { status: 401 })
        );
      }

      const subscription = await getLatestUserSubscription(session.userId);
      const customer = resolveBillingPortalCustomer(
        subscription,
        requestedCustomerId
      );

      if (!customer.ok) {
        const billingStatus =
          customer.reason === "customer-mismatch"
            ? "customer-mismatch"
            : "no-customer";
        return NextResponse.redirect(
          new URL(
            `/settings/subscription?billing=${billingStatus}`,
            request.url
          )
        );
      }

      try {
        const portalUrl = await createPortalSession(
          customer.customerId,
          origin
        );
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
