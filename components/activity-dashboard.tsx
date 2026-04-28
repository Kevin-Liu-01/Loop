"use client";

import { useState } from "react";

import { ActivityFeedImports } from "@/components/activity-feed-imports";
import { ActivityUsageToolbar } from "@/components/activity-usage-toolbar";
import { AutomationCalendar } from "@/components/automation-calendar";
import { AutomationEditModal } from "@/components/automation-edit-modal";
import { AreaChart } from "@/components/charts/area-chart";
import { StatTile } from "@/components/charts/stat-tile";
import {
  AutomationIcon,
  ChevronDownIcon,
  ClockIcon,
  PlusIcon,
  SettingsIcon,
} from "@/components/frontier-icons";
import { ImportSourcesList } from "@/components/import-sources-list";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/ui/empty-card";
import { LinkButton } from "@/components/ui/link-button";
import { Panel } from "@/components/ui/panel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { SkillIcon } from "@/components/ui/skill-icon";
import { StatusDot } from "@/components/ui/status-dot";
import { Tip } from "@/components/ui/tip";
import { useUsageComparisonMode } from "@/components/usage-comparison-context";
import { cn } from "@/lib/cn";
import type { RecentImportItem } from "@/lib/db/recent-imports";
import { formatNextRun } from "@/lib/schedule";
import type {
  AutomationSummary,
  LoopRunSummary,
  SkillRecord,
} from "@/lib/types";
import type {
  UsageDeltaSet,
  UsageOverview,
  UsageTotalsSnapshot,
} from "@/lib/usage";
import { usageStatTileValues } from "@/lib/usage";
import { peakVolumeHour, sumBucketTotals } from "@/lib/usage-sidebar-insights";

type ActivitySidebarTab = "automations" | "imports";

interface ActivityDashboardProps {
  overview: UsageOverview;
  automations: AutomationSummary[];
  loopRuns?: LoopRunSummary[];
  recentImports?: RecentImportItem[];
  skillMap?: Map<string, SkillRecord>;
  userSkillSlugs?: Set<string>;
  variant?: "default" | "sidebar";
}

interface ActivitySidebarViewProps {
  overview: UsageOverview;
  tileValues: UsageTotalsSnapshot;
  deltas: UsageDeltaSet;
  automations: AutomationSummary[];
  loopRuns: LoopRunSummary[];
  recentImports: RecentImportItem[];
  skillMap?: Map<string, SkillRecord>;
  userSkillSlugs?: Set<string>;
  viewsSpark: number[];
  interactionsSpark: number[];
  apiSpark: number[];
  latencySpark: number[];
  areaData: { label: string; value: number; secondary?: number }[];
  hasEvents: boolean;
  activeAutomations: AutomationSummary[];
  onEditAutomation?: (automation: AutomationSummary) => void;
}

function truncateRouteLabel(route: string, max = 36): string {
  const t = route.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max - 1)}…`;
}

const IMPORTS_COLLAPSED_LIMIT = 6;

function CollapsibleImports({ imports }: { imports: RecentImportItem[] }) {
  const [expanded, setExpanded] = useState(false);
  if (imports.length === 0) {
    return null;
  }

  const canCollapse = imports.length > IMPORTS_COLLAPSED_LIMIT;
  const visible =
    canCollapse && !expanded
      ? imports.slice(0, IMPORTS_COLLAPSED_LIMIT)
      : imports;
  const hiddenCount = imports.length - IMPORTS_COLLAPSED_LIMIT;

  return (
    <div className="border-t border-line pt-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
          Recently imported
        </span>
        <span className="text-[0.625rem] tabular-nums text-ink-faint/60">
          {imports.length}
        </span>
      </div>
      <ActivityFeedImports imports={visible} />
      {canCollapse && (
        <button
          className={cn(
            "mt-2 flex w-full items-center justify-center gap-1 py-1.5 text-[0.6875rem] font-medium text-ink-faint transition-colors hover:text-ink-soft"
          )}
          onClick={() => setExpanded((prev) => !prev)}
          type="button"
        >
          {expanded ? "Show less" : `Show ${hiddenCount} more`}
          <ChevronDownIcon
            className={cn(
              "h-3 w-3 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>
      )}
    </div>
  );
}

function SidebarSegment({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "relative flex items-center gap-1.5 px-2.5 py-1.5 text-[0.6875rem] font-medium transition-colors",
        active
          ? "bg-paper-3 text-ink dark:bg-paper-2"
          : "bg-transparent text-ink-faint hover:text-ink-soft hover:bg-paper-3/50 dark:hover:bg-paper-2/50"
      )}
      onClick={onClick}
      type="button"
    >
      {label}
      {typeof count === "number" && count > 0 && (
        <span className="tabular-nums text-[0.6rem] text-ink-faint">
          {count}
        </span>
      )}
    </button>
  );
}

type SkillScope = "yours" | "all";

function ActivitySidebarView({
  overview,
  tileValues,
  deltas,
  automations,
  loopRuns,
  recentImports,
  skillMap,
  userSkillSlugs,
  viewsSpark,
  interactionsSpark,
  apiSpark,
  latencySpark,
  areaData,
  hasEvents,
  activeAutomations,
  onEditAutomation,
}: ActivitySidebarViewProps) {
  const [sidebarTab, setSidebarTab] =
    useState<ActivitySidebarTab>("automations");
  const [listModalOpen, setListModalOpen] = useState(false);
  const hasUserSkills = userSkillSlugs && userSkillSlugs.size > 0;
  const [skillScope, setSkillScope] = useState<SkillScope>("all");
  const peak = peakVolumeHour(overview.timeSeries);
  const totalRolling = sumBucketTotals(overview.timeSeries);
  const topRoutes = overview.routeUsage.slice(0, 4);
  const mix = overview.activityCounts;

  const scopedAutomations =
    skillScope === "yours" && userSkillSlugs
      ? automations.filter((a) =>
          a.matchedSkillSlugs.some((slug) => userSkillSlugs.has(slug))
        )
      : automations;
  const scopedActiveAutomations =
    skillScope === "yours" && userSkillSlugs
      ? activeAutomations.filter((a) =>
          a.matchedSkillSlugs.some((slug) => userSkillSlugs.has(slug))
        )
      : activeAutomations;
  const scopedLoopRuns =
    skillScope === "yours" && userSkillSlugs
      ? loopRuns.filter((r) => userSkillSlugs.has(r.slug))
      : loopRuns;

  const sectionDivider = "border-t border-line pt-5";
  const showTabs = automations.length > 0 || recentImports.length > 0;

  return (
    <>
      <div className="grid gap-5">
        {showTabs ? (
          <section className="grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="m-0 font-serif text-2xl font-medium tracking-[-0.03em] text-ink">
                Activity
              </h2>
              <div className="flex items-center border border-line">
                <SidebarSegment
                  active={sidebarTab === "automations"}
                  count={scopedActiveAutomations.length}
                  label="Automations"
                  onClick={() => setSidebarTab("automations")}
                />
                <SidebarSegment
                  active={sidebarTab === "imports"}
                  count={recentImports.length}
                  label="Imports"
                  onClick={() => setSidebarTab("imports")}
                />
              </div>
            </div>

            {sidebarTab === "automations" ? (
              <>
                <div className="flex items-center gap-2">
                  {hasUserSkills && (
                    <div className="flex items-center border border-line">
                      <SidebarSegment
                        active={skillScope === "yours"}
                        label="Your skills"
                        onClick={() => setSkillScope("yours")}
                      />
                      <SidebarSegment
                        active={skillScope === "all"}
                        label="All skills"
                        onClick={() => setSkillScope("all")}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Tip content="Set up a new automation" side="top">
                      <Button
                        className="h-7 min-h-7 w-full gap-1 px-2 text-xs"
                        onClick={() =>
                          window.dispatchEvent(
                            new Event("loop:open-new-automation")
                          )
                        }
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <PlusIcon className="h-3 w-3" />
                        New
                      </Button>
                    </Tip>
                  </div>
                  {scopedAutomations.length > 0 && (
                    <div className="flex-1">
                      <Tip content="Browse and edit automations" side="top">
                        <Button
                          className="h-7 min-h-7 w-full gap-1 px-2 text-xs"
                          onClick={() => setListModalOpen(true)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <SettingsIcon className="h-3 w-3" />
                          Edit
                        </Button>
                      </Tip>
                    </div>
                  )}
                </div>
                {scopedAutomations.length > 0 ? (
                  <AutomationCalendar
                    automations={scopedAutomations}
                    loopRuns={scopedLoopRuns}
                    onEditAutomation={onEditAutomation}
                    skillMap={skillMap}
                    variant="sidebar"
                  />
                ) : (
                  <EmptyCard className="border-dashed py-4 text-sm">
                    {skillScope === "yours"
                      ? "No automations on your skills yet."
                      : "No automations configured yet."}
                  </EmptyCard>
                )}
              </>
            ) : (
              <div className="grid gap-4">
                <ImportSourcesList />
                <CollapsibleImports imports={recentImports} />
              </div>
            )}
          </section>
        ) : null}

        <section className={sectionDivider}>
          <ActivityUsageToolbar overview={overview} />
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <h3 className="m-0 font-serif text-lg font-medium leading-snug tracking-[-0.02em] text-ink">
                Event volume – 24h
              </h3>
              {peak ? (
                <p className="m-0 text-xs leading-relaxed text-ink-muted">
                  Peak <span className="tabular-nums">{peak.label}</span> ·{" "}
                  <span className="tabular-nums">{peak.count}</span> events ·
                  hover the chart for hourly detail
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.62rem] text-ink-faint">
              <Tip
                content="All events: views, interactions, and API calls"
                side="top"
              >
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-3 rounded-full bg-accent" />
                  total
                </span>
              </Tip>
              <Tip content="API calls only (skill endpoints)" side="top">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-3 rounded-full"
                    style={{
                      background: "var(--color-ink-faint)",
                      opacity: 0.55,
                    }}
                  />
                  api
                </span>
              </Tip>
            </div>
          </div>
          {hasEvents ? (
            <div className="-mx-1">
              <AreaChart
                id="home-events-sidebar"
                data={areaData}
                height={152}
              />
            </div>
          ) : (
            <EmptyCard className="rounded-none border-dashed py-5 text-sm">
              No events in the last 24 hours.
            </EmptyCard>
          )}
        </section>

        <section className={sectionDivider}>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-none border border-line bg-line/60 dark:bg-line/40">
            <StatTile
              className="border-0 rounded-none bg-paper-3 dark:bg-paper-2/90"
              delta={deltas.pageViews}
              label="views"
              size="compact"
              value={tileValues.pageViews}
              sparkData={viewsSpark}
            />
            <StatTile
              className="border-0 rounded-none bg-paper-3 dark:bg-paper-2/90"
              delta={deltas.interactions}
              label="interactions"
              size="compact"
              value={tileValues.interactions}
              sparkData={interactionsSpark}
            />
            <StatTile
              className="border-0 rounded-none bg-paper-3 dark:bg-paper-2/90"
              delta={deltas.apiCalls}
              label="api calls"
              size="compact"
              value={tileValues.apiCalls}
              sparkData={apiSpark}
            />
            <StatTile
              className="border-0 rounded-none bg-paper-3 dark:bg-paper-2/90"
              delta={deltas.avgApiDurationMs}
              label="avg api ms"
              size="compact"
              value={tileValues.avgApiDurationMs || "0"}
              sparkData={latencySpark}
            />
          </div>

          <div className="mt-5 grid gap-0 overflow-hidden border border-line bg-paper-2/50 dark:bg-paper-3/60">
            <div className="grid grid-cols-2 gap-px bg-line/50 dark:bg-line/30">
              <div className="flex flex-col gap-1 bg-paper-3 p-3 dark:bg-paper-2/80">
                <p className="m-0 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-ink-faint">
                  24h volume
                </p>
                <p className="m-0 text-lg font-semibold tabular-nums tracking-[-0.03em] text-ink">
                  {totalRolling}
                </p>
                <p className="m-0 text-[0.625rem] leading-snug text-ink-faint">
                  Events in hourly buckets
                </p>
              </div>
              <div className="flex flex-col gap-1 bg-paper-3 p-3 dark:bg-paper-2/80">
                <p className="m-0 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-ink-faint">
                  Peak hour
                </p>
                {peak ? (
                  <>
                    <p className="m-0 text-lg font-semibold tabular-nums tracking-[-0.03em] text-ink">
                      {peak.label}
                      <span className="ml-1 text-sm font-normal text-ink-muted">
                        · {peak.count}
                      </span>
                    </p>
                    <p className="m-0 text-[0.625rem] leading-snug text-ink-faint">
                      Busiest single hour
                    </p>
                  </>
                ) : (
                  <p className="m-0 text-sm text-ink-faint">No volume yet</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-line/60 bg-paper-3 px-3 py-2.5 dark:border-line/40 dark:bg-paper-2/80">
              <p className="m-0 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-ink-faint">
                API health
              </p>
              <span className="ml-auto flex items-center gap-1.5 text-xs tabular-nums">
                <StatusDot size="xs" tone="fresh" />
                <span className="font-medium text-ink">Healthy</span>
                <span className="text-ink-faint">·</span>
                <span className="text-ink-soft">
                  {overview.totalsRolling24h.apiCalls} calls
                </span>
              </span>
            </div>

            {topRoutes.length > 0 && (
              <div className="border-t border-line/60 bg-paper-3 px-3 py-2.5 dark:border-line/40 dark:bg-paper-2/80">
                <p className="m-0 mb-2 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-ink-faint">
                  Top routes
                </p>
                <ul className="m-0 grid list-none gap-1 p-0">
                  {topRoutes.map((r) => (
                    <li
                      className="flex min-w-0 items-baseline justify-between gap-2 text-[0.6875rem] leading-relaxed"
                      key={r.route}
                    >
                      <Tip content={r.route} side="left">
                        <span className="min-w-0 truncate font-mono text-ink-soft">
                          {truncateRouteLabel(r.route)}
                        </span>
                      </Tip>
                      <span className="shrink-0 tabular-nums font-medium text-ink">
                        {r.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mix.length > 0 && (
              <div className="border-t border-line/60 bg-paper-3 px-3 py-2.5 dark:border-line/40 dark:bg-paper-2/80">
                <p className="m-0 mb-2 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-ink-faint">
                  Activity mix
                </p>
                <div className="flex flex-wrap gap-1">
                  {mix.map((item) => (
                    <span
                      className="inline-flex items-center gap-1 border border-line/50 bg-paper-2/80 px-2 py-0.5 text-[0.625rem] tabular-nums dark:border-line/40 dark:bg-paper-3/40"
                      key={item.label}
                    >
                      <span className="font-semibold text-ink">
                        {item.count}
                      </span>
                      <span className="text-ink-faint">{item.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <AutomationListModal
        automations={scopedAutomations}
        onClose={() => setListModalOpen(false)}
        onEdit={(auto) => {
          setListModalOpen(false);
          onEditAutomation?.(auto);
        }}
        open={listModalOpen}
        skillMap={skillMap}
        userSkillSlugs={userSkillSlugs}
      />
    </>
  );
}

function AutomationListModal({
  automations,
  open,
  onClose,
  onEdit,
  skillMap,
  userSkillSlugs,
}: {
  automations: AutomationSummary[];
  open: boolean;
  onClose: () => void;
  onEdit: (auto: AutomationSummary) => void;
  skillMap?: Map<string, SkillRecord>;
  userSkillSlugs?: Set<string>;
}) {
  const sorted = [...automations].toSorted((a, b) => {
    const aOwn = a.matchedSkillSlugs.some((s) => userSkillSlugs?.has(s))
      ? 1
      : 0;
    const bOwn = b.matchedSkillSlugs.some((s) => userSkillSlugs?.has(s))
      ? 1
      : 0;
    if (aOwn !== bOwn) {
      return bOwn - aOwn;
    }
    const aActive = a.status === "ACTIVE" ? 1 : 0;
    const bActive = b.status === "ACTIVE" ? 1 : 0;
    return bActive - aActive;
  });

  const ownCount = sorted.filter((a) =>
    a.matchedSkillSlugs.some((s) => userSkillSlugs?.has(s))
  ).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0" maxWidth="lg">
        <DialogHeader>
          <DialogTitle>Edit automations</DialogTitle>
          <DialogDescription>
            {automations.length} automation{automations.length !== 1 ? "s" : ""}{" "}
            configured. Click one to edit its settings.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-0">
            {ownCount > 0 && (
              <div className="flex items-center gap-2 border-b border-line/40 bg-paper-2/30 px-6 py-1.5 dark:bg-paper-2/15">
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Your automations
                </span>
                <span className="text-[0.625rem] tabular-nums text-ink-faint/60">
                  {ownCount}
                </span>
              </div>
            )}
            {sorted.map((auto, i) => {
              const isFirstOther = ownCount > 0 && i === ownCount;
              const isOwn = auto.matchedSkillSlugs.some((s) =>
                userSkillSlugs?.has(s)
              );
              const skill = skillMap?.get(auto.matchedSkillSlugs[0]);
              const isActive = auto.status === "ACTIVE";
              const nextRun =
                isActive && auto.cadence !== "manual"
                  ? formatNextRun(
                      auto.cadence,
                      auto.preferredHour ?? 12,
                      auto.preferredDay
                    )
                  : null;
              return (
                <div key={auto.id}>
                  {isFirstOther && (
                    <div className="flex items-center gap-2 border-b border-line/40 bg-paper-2/30 px-6 py-1.5 dark:bg-paper-2/15">
                      <span className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                        All automations
                      </span>
                      <span className="text-[0.625rem] tabular-nums text-ink-faint/60">
                        {sorted.length - ownCount}
                      </span>
                    </div>
                  )}
                  <button
                    className="group flex w-full items-center gap-3 border-t border-line/60 px-6 py-3.5 text-left transition-colors first:border-t-0 hover:bg-paper-2/50 dark:hover:bg-paper-3/40"
                    onClick={() => onEdit(auto)}
                    type="button"
                  >
                    <SkillIcon
                      className="shrink-0 rounded-md"
                      iconUrl={skill?.iconUrl}
                      size={28}
                      slug={auto.matchedSkillSlugs[0] ?? auto.id}
                    />
                    <div className="min-w-0 flex-1 grid gap-0.5">
                      <div className="flex items-center gap-2">
                        <StatusDot
                          size="xs"
                          tone={isActive ? "fresh" : "idle"}
                          pulse={isActive}
                        />
                        <span className="truncate text-sm font-medium text-ink">
                          {auto.name}
                        </span>
                        <span className="shrink-0 text-[0.6875rem] text-ink-faint">
                          {isActive ? "Active" : "Paused"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink-faint">
                        <span>{auto.schedule?.trim() || "Manual"}</span>
                        {nextRun && (
                          <>
                            <span className="text-line-strong">·</span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-2.5 w-2.5" />
                              {nextRun}
                            </span>
                          </>
                        )}
                        {auto.matchedSkillSlugs.length > 0 && (
                          <>
                            <span className="text-line-strong">·</span>
                            <span>
                              {skill?.title ?? auto.matchedSkillSlugs[0]}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <SettingsIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} size="sm" type="button" variant="ghost">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function linkedSkillProps(
  automation: AutomationSummary,
  skillMap?: Map<string, SkillRecord>
): { skillSlug?: string; skillIconUrl?: string | null; skillName?: string } {
  const slug = automation.matchedSkillSlugs[0];
  if (!slug || !skillMap) {
    return {};
  }
  const skill = skillMap.get(slug);
  if (!skill) {
    return {};
  }
  return {
    skillIconUrl: skill.iconUrl,
    skillName: skill.title,
    skillSlug: skill.slug,
  };
}

function hasRollingUsage(overview: UsageOverview): boolean {
  return (
    overview.totalsRolling24h.pageViews +
      overview.totalsRolling24h.interactions +
      overview.totalsRolling24h.apiCalls >
    0
  );
}

export function shouldShowActivityDashboard(
  overview: UsageOverview,
  automations: AutomationSummary[],
  recentImports?: RecentImportItem[]
): boolean {
  return (
    hasRollingUsage(overview) ||
    automations.length > 0 ||
    (recentImports?.length ?? 0) > 0
  );
}

export function ActivityDashboard({
  overview,
  automations,
  loopRuns = [],
  recentImports = [],
  skillMap,
  userSkillSlugs,
  variant = "default",
}: ActivityDashboardProps) {
  const mode = useUsageComparisonMode();
  const tileValues = usageStatTileValues(overview, mode);
  const deltas = overview.comparisons[mode];
  const [editTarget, setEditTarget] = useState<AutomationSummary | null>(null);

  const viewsSpark = overview.timeSeries.map((b) => b.views);
  const interactionsSpark = overview.timeSeries.map((b) => b.interactions);
  const apiSpark = overview.timeSeries.map((b) => b.api);
  const latencySpark = overview.latencySeries.map((b) => b.avgMs);

  const areaData = overview.timeSeries.map((b) => ({
    label: b.label,
    secondary: b.api,
    value: b.total,
  }));

  const activeAutomations = automations.filter((a) => a.status === "ACTIVE");
  const hasEvents = hasRollingUsage(overview);

  if (!shouldShowActivityDashboard(overview, automations)) {
    return null;
  }

  const isSidebar = variant === "sidebar";

  if (isSidebar) {
    return (
      <>
        <ActivitySidebarView
          activeAutomations={activeAutomations}
          apiSpark={apiSpark}
          areaData={areaData}
          automations={automations}
          deltas={deltas}
          hasEvents={hasEvents}
          interactionsSpark={interactionsSpark}
          latencySpark={latencySpark}
          loopRuns={loopRuns}
          onEditAutomation={setEditTarget}
          overview={overview}
          recentImports={recentImports}
          skillMap={skillMap}
          userSkillSlugs={userSkillSlugs}
          tileValues={tileValues}
          viewsSpark={viewsSpark}
        />
        {editTarget && (
          <AutomationEditModal
            automation={editTarget}
            initialPreferredHour={editTarget.preferredHour}
            onClose={() => setEditTarget(null)}
            open
            {...linkedSkillProps(editTarget, skillMap)}
          />
        )}
      </>
    );
  }

  return (
    <Panel square>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-none border border-line bg-line/60 dark:bg-line/40 lg:grid-cols-4">
        <StatTile
          className="border-0 rounded-none bg-paper-3 dark:bg-paper-2/90"
          delta={deltas.pageViews}
          label="views"
          value={tileValues.pageViews}
          sparkData={viewsSpark}
        />
        <StatTile
          className="border-0 rounded-none bg-paper-3 dark:bg-paper-2/90"
          delta={deltas.interactions}
          label="interactions"
          value={tileValues.interactions}
          sparkData={interactionsSpark}
        />
        <StatTile
          className="border-0 rounded-none bg-paper-3 dark:bg-paper-2/90"
          delta={deltas.apiCalls}
          label="api calls"
          value={tileValues.apiCalls}
          sparkData={apiSpark}
        />
        <StatTile
          className="border-0 rounded-none bg-paper-3 dark:bg-paper-2/90"
          delta={deltas.avgApiDurationMs}
          label="avg api ms"
          value={tileValues.avgApiDurationMs || "0"}
          sparkData={latencySpark}
        />
      </div>

      <div
        className={cn(
          "grid items-stretch gap-px overflow-hidden rounded-none border border-line bg-line/60 dark:bg-line/40",
          automations.length > 0 && "lg:grid-cols-[minmax(0,1fr)_320px]"
        )}
      >
        <article
          className={cn(
            "grid gap-3.5 border-0 bg-paper-3 p-4 dark:bg-paper-2/90",
            automations.length > 0 && "lg:border-r lg:border-line"
          )}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="m-0 font-serif text-lg font-medium leading-snug tracking-[-0.02em] text-ink">
                Event volume – 24h
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[0.65rem] text-ink-faint">
              <Tip
                content="All events: views, interactions, and API calls"
                side="top"
              >
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-3 rounded-full bg-accent" />
                  total
                </span>
              </Tip>
              <Tip content="API calls only (skill endpoints)" side="top">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-3 rounded-full"
                    style={{
                      background: "var(--color-ink-faint)",
                      opacity: 0.5,
                    }}
                  />
                  api
                </span>
              </Tip>
            </div>
          </div>
          {hasEvents ? (
            <AreaChart id="home-events" data={areaData} />
          ) : (
            <EmptyCard className="border-line/80 bg-transparent">
              No events in the last 24 hours.
            </EmptyCard>
          )}
        </article>

        {automations.length > 0 ? (
          <article className="grid gap-3.5 border-0 bg-paper-3 p-4 dark:bg-paper-2/90">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="m-0 font-serif text-lg font-medium leading-snug tracking-[-0.02em] text-ink">
                  Automations
                </h3>
              </div>
              <Tip
                content={
                  activeAutomations.length > 0
                    ? `${activeAutomations.length} automation${activeAutomations.length !== 1 ? "s" : ""} running on schedule`
                    : "No automations currently enabled"
                }
                side="left"
              >
                <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                  <StatusDot
                    tone={activeAutomations.length > 0 ? "fresh" : "idle"}
                    pulse={activeAutomations.length > 0}
                  />
                  {activeAutomations.length} active
                </span>
              </Tip>
            </div>
            <AutomationCalendar
              automations={automations}
              loopRuns={loopRuns}
              onEditAutomation={setEditTarget}
              skillMap={skillMap}
            />
          </article>
        ) : null}
      </div>

      {editTarget && (
        <AutomationEditModal
          automation={editTarget}
          initialPreferredHour={editTarget.preferredHour}
          onClose={() => setEditTarget(null)}
          open
          {...linkedSkillProps(editTarget, skillMap)}
        />
      )}
    </Panel>
  );
}
