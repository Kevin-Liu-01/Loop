import { Suspense } from "react";

import { SystemObservabilityPanel } from "@/components/observability-panels";
import { SettingsSectionPage } from "@/components/settings-section-page";
import { SettingsSectionLoading } from "@/components/ui/settings-section-loading";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";
import { getSystemSnapshot } from "@/lib/system-summary";
import { buildUsageOverview } from "@/lib/usage";

export const dynamic = "force-dynamic";

export default function SettingsHealthPage() {
  return (
    <SettingsSectionPage sectionId="health">
      <Suspense
        fallback={<SettingsSectionLoading label="Checking system health" />}
      >
        <SettingsHealthData />
      </Suspense>
    </SettingsSectionPage>
  );
}

async function SettingsHealthData() {
  const timeZone = await getUsageTimeZoneFromCookie();
  const { systemState } = await getSystemSnapshot({ timeZone });
  const usageOverview = buildUsageOverview(systemState.usageEvents, {
    timeZone,
  });

  return (
    <SystemObservabilityPanel overview={usageOverview} timeZone={timeZone} />
  );
}
