import { AppGridShell } from "@/components/app-grid-shell";
import { CommandPalette } from "@/components/command-palette";
import { HomeShell } from "@/components/home-shell";
import { NewAutomationModal } from "@/components/new-automation-modal";
import { NewSkillModal } from "@/components/new-skill-modal";
import { SiteHeader } from "@/components/site-header";
import { LoadingStatusPill } from "@/components/ui/loading-status-pill";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { UsageBeacon } from "@/components/usage-beacon";
import { WelcomeModal } from "@/components/welcome-modal";
import { DEFAULT_PREFERRED_HOUR } from "@/lib/automation-constants";
import { cn } from "@/lib/cn";
import { listRecentImports } from "@/lib/db/recent-imports";
import { listSkillsByCreator } from "@/lib/db/skills";
import { buildMcpVersionHref } from "@/lib/format";
import { toHomeMcpDocument, toHomeSkillRecord } from "@/lib/home-catalogue";
import { formatScheduleLabel } from "@/lib/schedule";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";
import { getSystemSnapshot } from "@/lib/system-summary";
import { pageInsetPadX, pageInsetPadY } from "@/lib/ui-layout";
import { buildUsageOverview } from "@/lib/usage";

interface HomeDashboardProps {
  userId: string;
}

export async function HomeDashboard({ userId }: HomeDashboardProps) {
  const timeZone = await getUsageTimeZoneFromCookie();
  const [{ snapshot, systemState }, recentImports, ownSkills] =
    await Promise.all([
      getSystemSnapshot({ timeZone }),
      listRecentImports(20),
      listSkillsByCreator(userId),
    ]);
  const usageOverview = buildUsageOverview(systemState.usageEvents, {
    timeZone,
  });

  const catalogSlugs = new Set(snapshot.skills.map((skill) => skill.slug));
  const privateOwn = ownSkills.filter((skill) => !catalogSlugs.has(skill.slug));
  const mergedSkills = [...snapshot.skills, ...privateOwn];
  const homeSkills = mergedSkills.map((skill) => {
    const homeSkill = toHomeSkillRecord(skill);
    return skill.creatorClerkUserId === userId
      ? { ...homeSkill, href: `/signed-in${homeSkill.href}` }
      : homeSkill;
  });
  const homeMcps = snapshot.mcps.map(toHomeMcpDocument);

  const snapshotAutomationSlugs = new Set(
    snapshot.automations
      .map((automation) => automation.matchedSkillSlugs[0])
      .filter(Boolean)
  );
  const userAutomations = ownSkills
    .filter(
      (skill) => skill.automation && !snapshotAutomationSlugs.has(skill.slug)
    )
    .flatMap((skill) => {
      const { automation } = skill;
      if (!automation) {
        return [];
      }
      const hour = automation.preferredHour ?? DEFAULT_PREFERRED_HOUR;
      return [
        {
          cadence: automation.cadence,
          cwd: [] as string[],
          id: skill.slug,
          matchedCategorySlugs: [skill.category],
          matchedSkillSlugs: [skill.slug],
          name: `${skill.title} refresh`,
          path: "",
          preferredDay: automation.preferredDay,
          preferredHour: hour,
          preferredModel: automation.preferredModel,
          prompt:
            automation.prompt || `Refresh ${skill.title} from tracked sources.`,
          schedule: formatScheduleLabel(
            automation.cadence,
            hour,
            automation.preferredDay
          ),
          status: (automation.enabled ? "ACTIVE" : "PAUSED") as
            | "ACTIVE"
            | "PAUSED",
        },
      ];
    });
  const mergedAutomations = [...snapshot.automations, ...userAutomations];
  const paletteItems = [
    ...homeSkills.slice(0, 30).map((skill) => ({
      hint: skill.versionLabel,
      href: skill.href,
      label: skill.title,
      section: "Skill",
    })),
    ...snapshot.categories.map((category) => ({
      hint: category.status === "live" ? "Live" : "Seeded",
      href: `/home?category=${category.slug}`,
      label: category.title,
      section: "Category",
    })),
    {
      hint: "Agent environment",
      href: "/sandbox",
      label: "Sandbox",
      section: "Action",
    },
    {
      hint: "Ops",
      href: "/settings",
      label: "Settings",
      section: "Action",
    },
    ...homeMcps.slice(0, 20).map((mcp) => ({
      hint: mcp.transport,
      href: buildMcpVersionHref(mcp.name, mcp.version),
      label: mcp.name,
      section: "MCP",
    })),
  ];

  return (
    <>
      <UsageBeacon
        dedupeKey="page:/home"
        kind="page_view"
        label="Opened home"
        path="/home"
      />
      <CommandPalette items={paletteItems} />
      <NewSkillModal categories={snapshot.categories} />
      <NewAutomationModal skills={homeSkills} />
      <WelcomeModal />
      <HomeShell
        automations={mergedAutomations}
        categories={snapshot.categories}
        currentUserId={userId}
        loopRuns={systemState.loopRuns}
        mcps={homeMcps}
        recentImports={recentImports}
        skills={homeSkills}
        usageOverview={usageOverview}
      />
    </>
  );
}

export function HomeDashboardFallback() {
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
            {Array.from({ length: 6 }, (_, index) => (
              <div
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0"
                key={`home-skeleton-${index}`}
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
