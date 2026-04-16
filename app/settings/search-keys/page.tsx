import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

import { SearchKeysPanel } from "@/components/search-keys-panel";
import { SettingsSectionPage } from "@/components/settings-section-page";
import { SettingsSectionLoading } from "@/components/ui/settings-section-loading";
import {
  getUserSearchKeys,
  maskUserSearchKeys,
} from "@/lib/agent-tools/user-search-keys";

export const dynamic = "force-dynamic";

export default function SettingsSearchKeysPage() {
  return (
    <SettingsSectionPage sectionId="search-keys">
      <Suspense
        fallback={<SettingsSectionLoading label="Loading search keys" />}
      >
        <SettingsSearchKeysData />
      </Suspense>
    </SettingsSectionPage>
  );
}

async function SettingsSearchKeysData() {
  const { userId } = await auth();
  const keys = userId ? await getUserSearchKeys(userId) : null;

  return <SearchKeysPanel initialKeys={maskUserSearchKeys(keys)} />;
}
