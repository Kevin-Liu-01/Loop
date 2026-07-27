import type { Metadata } from "next";
import { Suspense } from "react";

import { LandingShell } from "@/components/home-landing/landing-shell";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LANDING_AUTOMATIONS,
  LANDING_MCPS,
  LANDING_SKILLS,
} from "@/lib/home-landing/landing-data";
import { fetchLandingData } from "@/lib/home-landing/landing-queries";
import { buildPageMetadata, SEO_DEFAULT_TITLE } from "@/lib/seo";

export const revalidate = 300;

const LANDING_DESCRIPTION =
  "Loop monitors, evaluates, and updates your agent playbooks. Every skill stays optimal, every parameter stays current.";

export const metadata: Metadata = buildPageMetadata({
  title: SEO_DEFAULT_TITLE,
  description: LANDING_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default async function RootPage() {
  return (
    <Suspense fallback={<PublicLandingFallback />}>
      <PublicLanding />
    </Suspense>
  );
}

async function PublicLanding() {
  const live = await fetchLandingData().catch(() => null);
  const hasLiveSkills = live && live.skills.length > 0;

  return (
    <LandingShell
      automations={hasLiveSkills ? live.automations : LANDING_AUTOMATIONS}
      mcps={hasLiveSkills ? live.mcps : LANDING_MCPS}
      staticSkills={hasLiveSkills ? live.skills : LANDING_SKILLS}
    />
  );
}

function PublicLandingFallback() {
  return (
    <div className="relative min-h-screen bg-paper text-ink">
      {/*
        Mirror the real landing nav layout: sticky on mobile, absolute on
        lg+ so it overlays the hero placeholder and doesn't push the
        skeleton headline down. Keeps the hero rhythm identical between
        the fallback and the hydrated render → no layout shift.
      */}
      <nav className="sticky top-0 z-30 mx-auto flex max-w-[1100px] items-center justify-between px-6 py-3.5 lg:absolute lg:inset-x-0">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="hidden h-9 w-64 md:block" />
          <Skeleton className="hidden h-9 w-20 md:block" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-24" />
        </div>
      </nav>
      <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-[min(14vh,140px)] text-center">
        <div className="grid gap-7">
          <div className="grid place-items-center gap-5">
            <Skeleton className="h-12 w-[90%] max-w-[760px]" />
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
