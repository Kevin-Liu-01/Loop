import { auth, currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";

import { SettingsSectionPage } from "@/components/settings-section-page";
import { SubscriptionPanel } from "@/components/subscription-panel";
import { SettingsSectionLoading } from "@/components/ui/settings-section-loading";
import { getUserSubscription } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function SettingsSubscriptionPage() {
  return (
    <SettingsSectionPage sectionId="subscription">
      <Suspense
        fallback={<SettingsSectionLoading label="Loading subscription" />}
      >
        <SettingsSubscriptionData />
      </Suspense>
    </SettingsSectionPage>
  );
}

async function SettingsSubscriptionData() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const subscription = userId ? await getUserSubscription(userId) : null;

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
