import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SeoJsonLd } from "@/components/seo-json-ld";
import { SkillDetailFallback } from "@/components/skill-detail-fallback";
import { SkillDetailPage } from "@/components/skill-detail-page";
import { getCachedPublicSkillRecordBySlug } from "@/lib/content";
import { getLatestSkillVersion, parseVersionSegment } from "@/lib/format";
import { buildSkillJsonLd, buildVersionedSkillMetadata } from "@/lib/seo";
import {
  getCachedSkillActivity,
  getCachedSkillUpstreams,
} from "@/lib/skill-detail-data";
import { buildSkillUsageSummary } from "@/lib/usage";

interface VersionedSkillPageProps {
  params: Promise<{
    slug: string;
    version: string;
  }>;
}

// Most of this route's traffic is crawlers walking every version of every skill, and each
// re-render rewrites the page's HTML and RSC (~1 MB uncompressed) to the ISR cache. Pinned
// versions never change, so a page renders once and stays cached:
// - archived versions read only their own record, so nothing but a visibility, deletion or
//   metadata edit (invalidateSkillData) expires them;
// - the latest version also reads activity, whose 1-day TTL caps how stale its usage stats get,
//   and is re-rendered by tag whenever the skill is saved (invalidateLatestSkillVersion).
export const revalidate = false;
export const dynamicParams = true;
// Supabase requests time out after 20 s (lib/db/client.ts). Cap the render well below the
// 300 s platform default so a stalled database can't hold an instance for five minutes.
export const maxDuration = 60;

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

  if (getLatestSkillVersion(skill) > skill.version) {
    return (
      <>
        <SeoJsonLd data={buildSkillJsonLd(skill)} />
        <SkillDetailPage
          archived
          canEdit={false}
          isSignedIn={false}
          previousSkill={previousSkill}
          purchased={false}
          skill={skill}
          timeZone="UTC"
        />
      </>
    );
  }

  const [activity, upstreams] = await Promise.all([
    getCachedSkillActivity(skill.slug),
    getCachedSkillUpstreams(skill.slug),
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
