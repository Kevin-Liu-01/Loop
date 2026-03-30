import { AutomationManager } from "@/components/automation-manager";
import { SettingsSectionPage } from "@/components/settings-section-page";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";
import { getSystemSnapshot } from "@/lib/system-summary";

export const dynamic = "force-dynamic";

export default async function SettingsAutomationsPage() {
  const timeZone = await getUsageTimeZoneFromCookie();
  const { snapshot } = await getSystemSnapshot({ timeZone });

  return (
    <SettingsSectionPage sectionId="automations">
      <AutomationManager automations={snapshot.automations} skills={snapshot.skills} />
    </SettingsSectionPage>
  );
}
