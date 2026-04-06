import { auth, currentUser } from "@clerk/nextjs/server";

import { SettingsSectionPage } from "@/components/settings-section-page";
import { SubscriptionPanel } from "@/components/subscription-panel";
import { getUserSubscription } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsSubscriptionPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const subscription = userId ? await getUserSubscription(userId) : null;

  return (
    <SettingsSectionPage sectionId="subscription">
      <SubscriptionPanel
        email={email}
        hasSubscription={subscription !== null}
        planSlug={subscription?.planSlug ?? null}
        status={subscription?.status ?? null}
        customerId={subscription?.customerId ?? null}
      />
    </SettingsSectionPage>
  );
}
