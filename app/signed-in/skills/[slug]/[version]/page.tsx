import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SkillDetailFallback } from "@/components/skill-detail-fallback";
import { SkillDetailPage } from "@/components/skill-detail-page";
import { getSessionUser } from "@/lib/auth";
import {
  getCachedPublicSkillRecordBySlug,
  getSkillRecordBySlug,
} from "@/lib/content";
import { findSkillAuthorForSession } from "@/lib/db/skill-authors";
import { parseVersionSegment } from "@/lib/format";
import { hasUserPurchasedSkill } from "@/lib/purchases";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";
import {
  canSessionEditSkill,
  canViewPrivateSkill,
} from "@/lib/skill-authoring";
import {
  getCachedSkillActivity,
  getCachedSkillBrief,
  getCachedSkillUpstreams,
} from "@/lib/skill-detail-data";
import { buildSkillUsageSummary } from "@/lib/usage";

interface SignedInSkillPageProps {
  params: Promise<{
    slug: string;
    version: string;
  }>;
}

export const metadata: Metadata = { robots: { follow: false, index: false } };

export default async function SignedInSkillPage({
  params,
}: SignedInSkillPageProps) {
  const { slug, version } = await params;
  const versionNumber = parseVersionSegment(version);
  if (!versionNumber) {
    notFound();
  }

  return (
    <Suspense fallback={<SkillDetailFallback />}>
      <SignedInSkillDetailData slug={slug} versionNumber={versionNumber} />
    </Suspense>
  );
}

async function SignedInSkillDetailData({
  slug,
  versionNumber,
}: {
  slug: string;
  versionNumber: number;
}) {
  const [session, publicSkill, publicPreviousSkill, timeZone] =
    await Promise.all([
      getSessionUser(),
      getCachedPublicSkillRecordBySlug(slug, versionNumber),
      versionNumber > 1
        ? getCachedPublicSkillRecordBySlug(slug, versionNumber - 1)
        : Promise.resolve(null),
      getUsageTimeZoneFromCookie(),
    ]);

  const skill =
    publicSkill ?? (await getSkillRecordBySlug(slug, versionNumber));
  if (!skill) {
    notFound();
  }

  const previousSkill =
    publicPreviousSkill ??
    (versionNumber > 1 && skill.visibility !== "public"
      ? await getSkillRecordBySlug(slug, versionNumber - 1)
      : null);
  const [sessionAuthor, activity, upstreams, purchased, brief] =
    await Promise.all([
      session ? findSkillAuthorForSession(session) : Promise.resolve(null),
      getCachedSkillActivity(skill.slug),
      getCachedSkillUpstreams(skill.slug),
      session?.userId
        ? hasUserPurchasedSkill(session.userId, slug)
        : Promise.resolve(false),
      getCachedSkillBrief(skill.category),
    ]);

  if (!canViewPrivateSkill(skill, session, sessionAuthor)) {
    notFound();
  }

  const canEdit = canSessionEditSkill(skill, session, sessionAuthor);
  const latestRun =
    activity.recentRuns.find(
      (run) =>
        run.slug === skill.slug &&
        run.origin === (skill.origin === "remote" ? "remote" : "user")
    ) ?? null;
  const usage = buildSkillUsageSummary(
    skill.slug,
    activity.usageEvents,
    activity.loopRuns
  );

  return (
    <SkillDetailPage
      brief={brief ?? undefined}
      canEdit={canEdit}
      isSignedIn={!!session}
      latestRun={latestRun}
      previousSkill={previousSkill}
      purchased={purchased || canEdit}
      skill={{ ...skill, upstreams }}
      timeZone={timeZone}
      usage={usage}
    />
  );
}
