import { auth, currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";

import { ConnectPanel } from "@/components/connect-panel";
import { SettingsSectionPage } from "@/components/settings-section-page";
import { SettingsSectionLoading } from "@/components/ui/settings-section-loading";
import { getUserSubscription } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function SettingsConnectPage() {
  return (
    <SettingsSectionPage sectionId="connect">
      <Suspense fallback={<SettingsSectionLoading label="Loading Connect" />}>
        <SettingsConnectData />
      </Suspense>
    </SettingsSectionPage>
  );
}

async function SettingsConnectData() {
  const { userId } = await auth();
  const user = await currentUser();
  const subscription = userId ? await getUserSubscription(userId) : null;
  const connectAccountId = (user?.publicMetadata as Record<string, unknown>)
    ?.stripeConnectAccountId as string | undefined;

  return (
    <ConnectPanel
      hasSubscription={subscription !== null}
      connectAccountId={connectAccountId ?? null}
    />
  );
}
