import { auth } from "@clerk/nextjs/server";

import { SearchKeysPanel } from "@/components/search-keys-panel";
import { SettingsSectionPage } from "@/components/settings-section-page";
import {
  getUserSearchKeys,
  maskUserSearchKeys,
} from "@/lib/agent-tools/user-search-keys";

export const dynamic = "force-dynamic";

export default async function SettingsSearchKeysPage() {
  const { userId } = await auth();
  const keys = userId ? await getUserSearchKeys(userId) : null;

  return (
    <SettingsSectionPage sectionId="search-keys">
      <SearchKeysPanel initialKeys={maskUserSearchKeys(keys)} />
    </SettingsSectionPage>
  );
}
