import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SeoJsonLd } from "@/components/seo-json-ld";
import { SkillDetailFallback } from "@/components/skill-detail-fallback";
import { SkillDetailPage } from "@/components/skill-detail-page";
import { getCachedPublicSkillRecordBySlug } from "@/lib/content";
import { parseVersionSegment } from "@/lib/format";
import { buildSkillJsonLd, buildVersionedSkillMetadata } from "@/lib/seo";
import {
  getCachedSkillActivity,
  getCachedSkillBrief,
  getCachedSkillUpstreams,
} from "@/lib/skill-detail-data";
import { buildSkillUsageSummary } from "@/lib/usage";

interface VersionedSkillPageProps {
  params: Promise<{
    slug: string;
    version: string;
  }>;
}

// A pinned version's content never changes, and ~80% of this route's traffic is crawlers walking
// every version of every skill. At 300 s each bot visit re-rendered the page and its data-cache
// entries (~86k ISR write units a day, roughly $10/month). A day keeps the activity/usage stats
// fresh enough for an archival page; the unversioned /skills/[slug] page renders dynamically and
// is unaffected.
export const revalidate = 86_400;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: VersionedSkillPageProps): Promise<Metadata> {
  const { slug, version } = await params;
  const versionNumber = parseVersionSegment(version);
  if (!versionNumber) {
    return {};
  }
  const skill = await getCachedPublicSkillRecordBySlug(slug, versionNumber);
  return skill ? buildVersionedSkillMetadata(skill) : {};
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
      <PublicSkillDetailData slug={slug} versionNumber={versionNumber} />
    </Suspense>
  );
}

async function PublicSkillDetailData({
  slug,
  versionNumber,
}: {
  slug: string;
  versionNumber: number;
}) {
  const [skill, previousSkill] = await Promise.all([
    getCachedPublicSkillRecordBySlug(slug, versionNumber),
    versionNumber > 1
      ? getCachedPublicSkillRecordBySlug(slug, versionNumber - 1)
      : Promise.resolve(null),
  ]);

  if (!skill) {
    notFound();
  }

  const [activity, upstreams, brief] = await Promise.all([
    getCachedSkillActivity(skill.slug),
    getCachedSkillUpstreams(skill.slug),
    getCachedSkillBrief(skill.category),
  ]);
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
    <>
      <SeoJsonLd data={buildSkillJsonLd(skill)} />
      <SkillDetailPage
        brief={brief ?? undefined}
        canEdit={false}
        isSignedIn={false}
        latestRun={latestRun}
        previousSkill={previousSkill}
        purchased={false}
        skill={{ ...skill, upstreams }}
        timeZone="UTC"
        usage={usage}
      />
    </>
  );
}
