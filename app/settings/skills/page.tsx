import { Suspense } from "react";

import { SettingsSectionPage } from "@/components/settings-section-page";
import { SettingsSkillsOverview } from "@/components/settings-skills-overview";
import { SettingsSectionLoading } from "@/components/ui/settings-section-loading";
import { getSessionUser } from "@/lib/auth";
import { findSkillAuthorForSession } from "@/lib/db/skill-authors";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";
import { canSessionEditSkill } from "@/lib/skill-authoring";
import { listLoopRunSummaries } from "@/lib/system-state";
import { getSystemSnapshot } from "@/lib/system-summary";

export const dynamic = "force-dynamic";

export default function SettingsSkillsPage() {
  return (
    <SettingsSectionPage sectionId="skills">
      <Suspense
        fallback={<SettingsSectionLoading label="Loading your skills" />}
      >
        <SettingsSkillsData />
      </Suspense>
    </SettingsSectionPage>
  );
}

async function SettingsSkillsData() {
  const timeZone = await getUsageTimeZoneFromCookie();
  const [session, { snapshot }] = await Promise.all([
    getSessionUser(),
    getSystemSnapshot({ includePrivate: true, timeZone }),
  ]);

  const sessionAuthor = session
    ? await findSkillAuthorForSession(session)
    : null;

  const userSkills = snapshot.skills.filter(
    (skill) =>
      skill.origin === "user" &&
      canSessionEditSkill(skill, session, sessionAuthor)
  );

  // Fetch just this user's skill runs, lean projection, enough rows to cover
  // the latest run per skill without pulling the full JSONB payload.
  const userSlugs = userSkills.map((skill) => skill.slug);
  const loopRuns =
    userSlugs.length > 0
      ? await listLoopRunSummaries({ skillSlugs: userSlugs, limit: 500 })
      : [];

  const latestRunBySlug = new Map<string, (typeof loopRuns)[number]>();
  for (const run of loopRuns) {
    if (!latestRunBySlug.has(run.slug)) {
      latestRunBySlug.set(run.slug, run);
    }
  }

  return (
    <SettingsSkillsOverview
      latestRuns={Object.fromEntries(latestRunBySlug)}
      skills={userSkills}
    />
  );
}
