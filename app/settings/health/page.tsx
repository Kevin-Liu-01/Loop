import { SystemObservabilityPanel } from "@/components/observability-panels";
import { SettingsSectionPage } from "@/components/settings-section-page";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";
import { getSystemSnapshot } from "@/lib/system-summary";
import { buildUsageOverview } from "@/lib/usage";

export const dynamic = "force-dynamic";

export default async function SettingsHealthPage() {
  const timeZone = await getUsageTimeZoneFromCookie();
  const { systemState } = await getSystemSnapshot({ timeZone });
  const usageOverview = buildUsageOverview(systemState.usageEvents, { timeZone });

  return (
    <SettingsSectionPage sectionId="health">
      <SystemObservabilityPanel overview={usageOverview} />
    </SettingsSectionPage>
  );
}
