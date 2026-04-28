import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AppGridShell } from "@/components/app-grid-shell";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { SiteHeader } from "@/components/site-header";
import { SkillDetailPage } from "@/components/skill-detail-page";
import { LoadingStatusPill } from "@/components/ui/loading-status-pill";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { getSkillRecordBySlug } from "@/lib/content";
import { findSkillAuthorForSession } from "@/lib/db/skill-authors";
import { listSkillUpstreams } from "@/lib/db/skill-intelligence";
import { getBrief, parseVersionSegment } from "@/lib/format";
import { hasUserPurchasedSkill } from "@/lib/purchases";
import { getLoopSnapshot } from "@/lib/refresh";
import { buildSkillJsonLd, buildSkillMetadata } from "@/lib/seo";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";
import {
  canSessionEditSkill,
  canViewPrivateSkill,
} from "@/lib/skill-authoring";
import { listLoopRuns, listUsageEvents } from "@/lib/system-state";
import { pageInsetPadX } from "@/lib/ui-layout";
import { buildSkillUsageSummary } from "@/lib/usage";

interface VersionedSkillPageProps {
  params: Promise<{
    slug: string;
    version: string;
  }>;
}

export async function generateMetadata({
  params,
}: VersionedSkillPageProps): Promise<Metadata> {
  const { slug, version } = await params;
  const versionNumber = parseVersionSegment(version);
  if (!versionNumber) {
    return {};
  }
  const skill = await getSkillRecordBySlug(slug, versionNumber);
  if (!skill) {
    return {};
  }
  return buildSkillMetadata(skill);
}

export default async function VersionedSkillPage({
  params,
}: VersionedSkillPageProps) {
  const { slug, version } = await params;
  const versionNumber = parseVersionSegment(version);

  if (!versionNumber) {
    notFound();
  }

  return (
    <Suspense fallback={<SkillDetailFallback />}>
      <SkillDetailData slug={slug} versionNumber={versionNumber} />
    </Suspense>
  );
}

async function SkillDetailData({
  slug,
  versionNumber,
}: {
  slug: string;
  versionNumber: number;
}) {
  const [
    session,
    snapshot,
    skill,
    previousSkill,
    loopRuns,
    usageEvents,
    timeZone,
  ] = await Promise.all([
    getSessionUser(),
    getLoopSnapshot(),
    getSkillRecordBySlug(slug, versionNumber),
    versionNumber > 1
      ? getSkillRecordBySlug(slug, versionNumber - 1)
      : Promise.resolve(null),
    listLoopRuns({ skillSlug: slug, limit: 20 }),
    listUsageEvents(),
    getUsageTimeZoneFromCookie(),
  ]);

  if (!skill) {
    notFound();
  }

  const sessionAuthor = session
    ? await findSkillAuthorForSession(session)
    : null;

  if (!canViewPrivateSkill(skill, session, sessionAuthor)) {
    notFound();
  }

  const upstreams = await listSkillUpstreams(skill.slug);

  const purchased = session?.userId
    ? await hasUserPurchasedSkill(session.userId, slug)
    : false;
  const canEdit = canSessionEditSkill(skill, session, sessionAuthor);

  const brief = getBrief(snapshot.dailyBriefs, skill.category);
  const latestRun =
    loopRuns.find(
      (run) =>
        run.slug === skill.slug &&
        run.origin === (skill.origin === "remote" ? "remote" : "user")
    ) ?? null;
  const usage = buildSkillUsageSummary(skill.slug, usageEvents, loopRuns);

  return (
    <>
      <SeoJsonLd data={buildSkillJsonLd(skill)} />
      <SkillDetailPage
        brief={brief}
        canEdit={canEdit}
        isSignedIn={!!session}
        latestRun={latestRun}
        previousSkill={previousSkill}
        purchased={purchased || canEdit}
        skill={{ ...skill, upstreams }}
        timeZone={timeZone}
        usage={usage}
      />
    </>
  );
}

function SkillDetailFallback() {
  return (
    <AppGridShell header={<SiteHeader />}>
      <PageShell inset className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "grid min-h-0 flex-1 gap-6 overflow-y-auto py-6 sm:py-8",
            pageInsetPadX
          )}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10" />
            <div className="grid gap-1.5">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-80" />
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,0.4fr)] gap-6 max-lg:grid-cols-1">
            <div className="grid gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="grid gap-4 self-start">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </PageShell>
      <LoadingStatusPill label="Loading skill" />
    </AppGridShell>
  );
}
