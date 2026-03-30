import { HomeShell } from "@/components/home-shell";
import { UsageBeacon } from "@/components/usage-beacon";
import { getSystemSnapshot } from "@/lib/system-summary";
import { buildUsageOverview } from "@/lib/usage";

export default async function HomePage() {
  const { snapshot, systemState } = await getSystemSnapshot();
  const usageOverview = buildUsageOverview(systemState.usageEvents);

  return (
    <>
      <UsageBeacon
        dedupeKey="page:/"
        kind="page_view"
        label="Opened home"
        path="/"
      />
      <HomeShell
        automations={snapshot.automations}
        categories={snapshot.categories}
        loopRuns={systemState.loopRuns}
        skills={snapshot.skills}
        usageOverview={usageOverview}
      />
    </>
  );
}
