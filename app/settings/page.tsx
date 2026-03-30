import { auth, currentUser } from "@clerk/nextjs/server";

import { AutomationManager } from "@/components/automation-manager";
import { ConnectPanel } from "@/components/connect-panel";
import { RefreshControls } from "@/components/refresh-controls";
import { SubscriptionPanel } from "@/components/subscription-panel";
import { SystemObservabilityPanel } from "@/components/observability-panels";
import { SiteHeader } from "@/components/site-header";
import { UsageBeacon } from "@/components/usage-beacon";
import { PageShell } from "@/components/ui/page-shell";
import { getUserSubscription } from "@/lib/auth";
import { getSystemSnapshot } from "@/lib/system-summary";
import { buildUsageOverview } from "@/lib/usage";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const { snapshot, systemState } = await getSystemSnapshot();
  const usageOverview = buildUsageOverview(systemState.usageEvents);

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const subscription = userId ? await getUserSubscription(userId) : null;
  const connectAccountId =
    (user?.publicMetadata as Record<string, unknown>)?.stripeConnectAccountId as string | undefined;

  return (
    <>
      <UsageBeacon
        dedupeKey="page:/settings"
        kind="page_view"
        label="Opened settings"
        path="/settings"
      />
      <SiteHeader />

      <PageShell narrow className="grid gap-8 pt-8 pb-16">
        <header className="grid gap-1">
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink">
            Settings
          </h1>
          <p className="m-0 text-sm text-ink-soft">
            Account, subscription, Stripe Connect, automations, and system health.
          </p>
        </header>

        <section id="subscription" className="grid gap-5">
          <h2 className="m-0 text-lg font-semibold tracking-tight text-ink">
            Subscription
          </h2>
          <SubscriptionPanel
            email={email}
            hasSubscription={subscription !== null}
            planSlug={subscription?.planSlug ?? null}
            status={subscription?.status ?? null}
          />
        </section>

        <section id="connect" className="grid gap-5">
          <h2 className="m-0 text-lg font-semibold tracking-tight text-ink">
            Stripe Connect
          </h2>
          <ConnectPanel
            hasSubscription={subscription !== null}
            connectAccountId={connectAccountId ?? null}
          />
        </section>

        <section id="refresh" className="grid gap-5">
          <h2 className="m-0 text-lg font-semibold tracking-tight text-ink">
            Refresh
          </h2>
          <RefreshControls />
        </section>

        <section id="automations" className="grid gap-5">
          <h2 className="m-0 text-lg font-semibold tracking-tight text-ink">
            Automations
          </h2>
          <AutomationManager
            automations={snapshot.automations}
            skills={snapshot.skills}
          />
        </section>

        <section id="health" className="grid gap-5">
          <h2 className="m-0 text-lg font-semibold tracking-tight text-ink">
            System Health
          </h2>
          <SystemObservabilityPanel overview={usageOverview} />
        </section>
      </PageShell>
    </>
  );
}
