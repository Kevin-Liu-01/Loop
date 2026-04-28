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
import { DEFAULT_PREFERRED_HOUR } from "@/lib/automation-constants";
import { cn } from "@/lib/cn";
import { listRecentImports } from "@/lib/db/recent-imports";
import { listSkillsByCreator } from "@/lib/db/skills";
import {
  LANDING_AUTOMATIONS,
  LANDING_MCPS,
  LANDING_SKILLS,
} from "@/lib/home-landing/landing-data";
import { fetchLandingData } from "@/lib/home-landing/landing-queries";
import { formatScheduleLabel } from "@/lib/schedule";
import { buildPageMetadata, SEO_DEFAULT_TITLE } from "@/lib/seo";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";
import { getSystemSnapshot } from "@/lib/system-summary";
import { pageInsetPadX, pageInsetPadY } from "@/lib/ui-layout";
import { buildUsageOverview } from "@/lib/usage";

export const dynamic = "force-dynamic";

const LANDING_DESCRIPTION =
  "Loop monitors, evaluates, and updates your agent playbooks. Every skill stays optimal, every parameter stays current.";

export const metadata: Metadata = buildPageMetadata({
  title: SEO_DEFAULT_TITLE,
  description: LANDING_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

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
  const { userId } = await auth();
  const timeZone = await getUsageTimeZoneFromCookie();
  const [{ snapshot, systemState }, recentImports, ownSkills] =
    await Promise.all([
      getSystemSnapshot({ timeZone }),
      listRecentImports(20),
      userId ? listSkillsByCreator(userId) : Promise.resolve([]),
    ]);
  const usageOverview = buildUsageOverview(systemState.usageEvents, {
    timeZone,
  });

  const catalogSlugs = new Set(snapshot.skills.map((s) => s.slug));
  const privateOwn = ownSkills.filter((s) => !catalogSlugs.has(s.slug));
  const mergedSkills = [...snapshot.skills, ...privateOwn];

  const snapshotAutoSlugs = new Set(
    snapshot.automations.map((a) => a.matchedSkillSlugs[0]).filter(Boolean)
  );
  const userAutomations = ownSkills
    .filter((s) => s.automation && !snapshotAutoSlugs.has(s.slug))
    .map((s) => {
      const auto = s.automation!;
      const hour = auto.preferredHour ?? DEFAULT_PREFERRED_HOUR;
      return {
        cadence: auto.cadence,
        cwd: [] as string[],
        id: s.slug,
        matchedCategorySlugs: [s.category],
        matchedSkillSlugs: [s.slug],
        name: `${s.title} refresh`,
        path: "",
        preferredDay: auto.preferredDay,
        preferredHour: hour,
        preferredModel: auto.preferredModel,
        prompt: auto.prompt || `Refresh ${s.title} from tracked sources.`,
        schedule: formatScheduleLabel(auto.cadence, hour, auto.preferredDay),
        status: (auto.enabled ? "ACTIVE" : "PAUSED") as "ACTIVE" | "PAUSED",
      };
    });
  const mergedAutomations = [...snapshot.automations, ...userAutomations];

  return (
    <>
      <UsageBeacon
        dedupeKey="page:/"
        kind="page_view"
        label="Opened home"
        path="/"
      />
      <HomeShell
        automations={mergedAutomations}
        categories={snapshot.categories}
        currentUserId={userId ?? undefined}
        loopRuns={systemState.loopRuns}
        mcps={snapshot.mcps}
        recentImports={recentImports}
        skills={mergedSkills}
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
    <div className="min-h-screen bg-paper text-ink">
      <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="hidden h-9 w-40 sm:block" />
          <Skeleton className="h-9 w-24" />
        </div>
      </nav>
      <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-[min(14vh,120px)] text-center">
        <div className="mx-auto grid max-w-[700px] gap-7">
          <div className="grid place-items-center gap-5">
            <Skeleton className="h-14 w-[80%] max-w-[500px]" />
            <Skeleton className="h-6 w-[60%] max-w-[380px]" />
          </div>
          <div className="flex justify-center gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
