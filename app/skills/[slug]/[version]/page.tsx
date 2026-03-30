import { notFound } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { SkillDetailPage } from "@/components/skill-detail-page";
import { getSkillRecordBySlug } from "@/lib/content";
import { getBrief, parseVersionSegment } from "@/lib/format";
import { hasUserPurchasedSkill } from "@/lib/purchases";
import { getLoopSnapshot } from "@/lib/refresh";
import { listLoopRuns, listUsageEvents } from "@/lib/system-state";
import { buildSkillUsageSummary } from "@/lib/usage";

type VersionedSkillPageProps = {
  params: Promise<{
    slug: string;
    version: string;
  }>;
};

export default async function VersionedSkillPage({ params }: VersionedSkillPageProps) {
  const { slug, version } = await params;
  const versionNumber = parseVersionSegment(version);

  if (!versionNumber) {
    notFound();
  }

  const [{ userId }, snapshot, skill, previousSkill, loopRuns, usageEvents] = await Promise.all([
    auth(),
    getLoopSnapshot(),
    getSkillRecordBySlug(slug, versionNumber),
    versionNumber > 1 ? getSkillRecordBySlug(slug, versionNumber - 1) : Promise.resolve(null),
    listLoopRuns(),
    listUsageEvents()
  ]);

  if (!skill) {
    notFound();
  }

  const purchased = userId ? await hasUserPurchasedSkill(userId, slug) : false;
  const isCreator = userId !== null && skill.creatorClerkUserId === userId;

  const brief = getBrief(snapshot.dailyBriefs, skill.category);
  const latestRun =
    loopRuns.find(
      (run) => run.slug === skill.slug && run.origin === (skill.origin === "remote" ? "remote" : "user")
    ) ?? null;
  const usage = buildSkillUsageSummary(skill.slug, usageEvents, loopRuns);

  return (
    <SkillDetailPage
      brief={brief}
      latestRun={latestRun}
      previousSkill={previousSkill}
      purchased={purchased || isCreator}
      skill={skill}
      usage={usage}
    />
  );
}
