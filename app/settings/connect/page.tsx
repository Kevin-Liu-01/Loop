import { auth, currentUser } from "@clerk/nextjs/server";

import { ConnectPanel } from "@/components/connect-panel";
import { SettingsSectionPage } from "@/components/settings-section-page";
import { getUserSubscription } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsConnectPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const subscription = userId ? await getUserSubscription(userId) : null;
  const connectAccountId =
    (user?.publicMetadata as Record<string, unknown>)?.stripeConnectAccountId as string | undefined;

  return (
    <SettingsSectionPage sectionId="connect">
      <ConnectPanel
        hasSubscription={subscription !== null}
        connectAccountId={connectAccountId ?? null}
      />
    </SettingsSectionPage>
  );
}
