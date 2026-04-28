import { auth, currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";

import { SettingsSectionPage } from "@/components/settings-section-page";
import { SubscriptionPanel } from "@/components/subscription-panel";
import { SettingsSectionLoading } from "@/components/ui/settings-section-loading";
import { getLatestUserSubscription } from "@/lib/auth";
import { reconcileCheckoutSession } from "@/lib/stripe-reconcile";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function SettingsSubscriptionPage({ searchParams }: PageProps) {
  return (
    <SettingsSectionPage sectionId="subscription">
      <Suspense
        fallback={<SettingsSectionLoading label="Loading subscription" />}
      >
        <SettingsSubscriptionData searchParams={searchParams} />
      </Suspense>
    </SettingsSectionPage>
  );
}

async function SettingsSubscriptionData({ searchParams }: PageProps) {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : undefined;
  const isCheckoutReturn = params.checkout === "success" && sessionId;

  if (isCheckoutReturn && userId) {
    await reconcileCheckoutSession(sessionId).catch((error) => {
      console.error("[subscription] Checkout reconciliation failed:", error);
    });
  }

  const subscription = userId ? await getLatestUserSubscription(userId) : null;

  return (
    <SubscriptionPanel
      email={email}
      hasSubscription={subscription !== null}
      planSlug={subscription?.planSlug ?? null}
      status={subscription?.status ?? null}
      customerId={subscription?.customerId ?? null}
    />
  );
}
