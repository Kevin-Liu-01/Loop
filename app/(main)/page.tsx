import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Suspense } from "react";

import { AppGridShell } from "@/components/app-grid-shell";
import { LandingShell } from "@/components/home-landing/landing-shell";
import { HomeShell } from "@/components/home-shell";
import { SiteHeader } from "@/components/site-header";
import { LoadingStatusPill } from "@/components/ui/loading-status-pill";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { UsageBeacon } from "@/components/usage-beacon";
import { cn } from "@/lib/cn";
import { listRecentImports } from "@/lib/db/recent-imports";
import {
  LANDING_AUTOMATIONS,
  LANDING_MCPS,
  LANDING_SKILLS,
} from "@/lib/home-landing/landing-data";
import { fetchLandingData } from "@/lib/home-landing/landing-queries";
import {
  buildDefaultOpenGraphImages,
  buildDefaultTwitterImageUrls,
  buildSiteUrl,
  SEO_DEFAULT_TITLE,
  SITE_NAME,
} from "@/lib/seo";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";
import { getSystemSnapshot } from "@/lib/system-summary";
import { pageInsetPadX, pageInsetPadY } from "@/lib/ui-layout";
import { buildUsageOverview } from "@/lib/usage";

export const dynamic = "force-dynamic";

const LANDING_DESCRIPTION =
  "Loop monitors, evaluates, and updates your agent playbooks. Every skill stays optimal, every parameter stays current.";

export const metadata: Metadata = {
  description: LANDING_DESCRIPTION,
  openGraph: {
    description: LANDING_DESCRIPTION,
    images: buildDefaultOpenGraphImages(),
    locale: "en_US",
    siteName: SITE_NAME,
    title: SEO_DEFAULT_TITLE,
    type: "website",
    url: buildSiteUrl("/").toString(),
  },
  title: { absolute: SEO_DEFAULT_TITLE },
  twitter: {
    card: "summary_large_image",
    description: LANDING_DESCRIPTION,
    images: buildDefaultTwitterImageUrls(),
    title: SEO_DEFAULT_TITLE,
  },
};

export default async function RootPage() {
  let userId: string | null = null;
  try {
    ({ userId } = await auth());
  } catch {
    // Bots and crawlers that bypass middleware can't resolve auth –
    // treat them as signed-out so the landing page (with OG tags) renders.
  }

  if (userId) {
    return (
      <Suspense fallback={<AuthenticatedDashboardFallback />}>
        <AuthenticatedDashboard />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PublicLandingFallback />}>
      <PublicLanding />
    </Suspense>
  );
}

async function AuthenticatedDashboard() {
  const timeZone = await getUsageTimeZoneFromCookie();
  const [{ snapshot, systemState }, recentImports] = await Promise.all([
    getSystemSnapshot({ timeZone }),
    listRecentImports(20),
  ]);
  const usageOverview = buildUsageOverview(systemState.usageEvents, {
    timeZone,
  });

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
        mcps={snapshot.mcps}
        recentImports={recentImports}
        skills={snapshot.skills}
        usageOverview={usageOverview}
      />
    </>
  );
}

function AuthenticatedDashboardFallback() {
  return (
    <AppGridShell header={<SiteHeader />}>
      <PageShell inset narrow className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "grid min-h-0 flex-1 gap-4 overflow-y-auto",
            pageInsetPadX,
            pageInsetPadY
          )}
        >
          <header className="grid min-w-0 gap-2">
            <div className="flex items-baseline gap-4">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="h-3 w-56" />
          </header>

          <div className="grid gap-3">
            <Skeleton className="h-9 w-full" />
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>

          <div className="grid gap-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                key={i}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0"
              >
                <div className="flex items-start gap-2.5">
                  <Skeleton className="mt-0.5 h-7 w-7 shrink-0" />
                  <div className="grid min-w-0 flex-1 gap-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-80" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-7 w-7" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageShell>
      <LoadingStatusPill label="Loading catalog" />
    </AppGridShell>
  );
}

async function PublicLanding() {
  const live = await fetchLandingData().catch(() => null);
  const hasLiveSkills = live && live.skills.length > 0;

  return (
    <LandingShell
      automations={hasLiveSkills ? live.automations : LANDING_AUTOMATIONS}
      mcps={hasLiveSkills ? live.mcps : LANDING_MCPS}
      skills={hasLiveSkills ? live.skills : undefined}
      staticSkills={hasLiveSkills ? undefined : LANDING_SKILLS}
    />
  );
}

function PublicLandingFallback() {
  return (
    <AppGridShell header={<SiteHeader />}>
      <PageShell inset narrow className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "grid min-h-0 flex-1 content-start gap-8",
            pageInsetPadX,
            pageInsetPadY
          )}
        >
          <div className="grid gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-3/4 max-w-[42rem]" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-1">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        </div>
      </PageShell>
      <LoadingStatusPill label="Loading Loop" />
    </AppGridShell>
  );
}
