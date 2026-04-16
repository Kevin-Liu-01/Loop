import type { LoopRunSummary, UsageEventRecord } from "@/lib/types";
import { bucketEventsByHour, bucketLatencyByHour } from "@/lib/usage-charts";
import type { LatencyBucket, TimeSeriesBucket } from "@/lib/usage-charts";
import type { UsageComparisonMode } from "@/lib/usage-comparison-modes";
import {
  filterEventsInClosedRange,
  prior24hWindowBeforeRolling,
  rolling24hWindowEndInclusive,
  startOfDayInTimeZone,
  yesterdaySameClockWindow,
} from "@/lib/usage-day-bounds";
import {
  latencyHalfComparison,
  rollingHalfDeltas,
} from "@/lib/usage-sidebar-insights";
import { buildVsYesterdayStrings } from "@/lib/usage-vs-yesterday";

export interface RouteUsageSummary {
  route: string;
  count: number;
  errorCount: number;
  avgDurationMs: number;
  lastAt: string;
}

export interface UsageTotalsSnapshot {
  pageViews: number;
  interactions: number;
  apiCalls: number;
  errorCalls: number;
  avgApiDurationMs: number;
}

export interface UsageDeltaSet {
  pageViews: string | null;
  interactions: string | null;
  apiCalls: string | null;
  avgApiDurationMs: string | null;
}

/** @deprecated Use `comparisons.yesterday_same_time` */
export type VsYesterdaySameTime = UsageDeltaSet;

export interface UsageOverview {
  /** IANA zone used for “today” / “yesterday same time” windows. */
  timeZone: string;
  /** Local calendar day in `timeZone`: midnight → now. */
  totals: UsageTotalsSnapshot;
  /** Last 24h rolling; aligns with timeline chart and route breakdown. */
  totalsRolling24h: UsageTotalsSnapshot;
  /** @deprecated Use `comparisons.yesterday_same_time` */
  vsYesterday: UsageDeltaSet;
  comparisons: Record<UsageComparisonMode, UsageDeltaSet>;
  /** Short labels for UI toggles. */
  comparisonFootnotes: Record<UsageComparisonMode, string>;
  timeSeries: TimeSeriesBucket[];
  latencySeries: LatencyBucket[];
  routeUsage: RouteUsageSummary[];
  recentEvents: UsageEventRecord[];
  activityCounts: {
    label: string;
    count: number;
  }[];
}

export interface SkillDailyCount {
  date: string;
  views: number;
  copies: number;
  saves: number;
  refreshes: number;
  apiCalls: number;
}

export interface SkillUsageSummary {
  pageViews: number;
  copies: number;
  saves: number;
  refreshes: number;
  apiCalls: number;
  lastSeenAt: string | null;
  recentEvents: UsageEventRecord[];
  dailyCounts: SkillDailyCount[];
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}

export function formatUsageEvent(event: UsageEventRecord): string {
  if (event.kind === "api_call") {
    return `${event.method ?? "CALL"} ${event.route ?? event.label}`;
  }

  return event.label;
}

/** Main numbers on stat tiles depend on comparison mode (today vs rolling 24h). */
export function usageStatTileValues(
  overview: UsageOverview,
  mode: UsageComparisonMode
): UsageTotalsSnapshot {
  if (mode === "yesterday_same_time") {
    return overview.totals;
  }
  return overview.totalsRolling24h;
}

export function computeUsageTotals(
  events: UsageEventRecord[]
): UsageTotalsSnapshot {
  const pageViews = events.filter((event) => event.kind === "page_view").length;
  const apiEvents = events.filter((event) => event.kind === "api_call");
  const interactions = events.length - pageViews - apiEvents.length;
  return {
    apiCalls: apiEvents.length,
    avgApiDurationMs: average(
      apiEvents
        .map((event) => event.durationMs ?? 0)
        .filter((value) => value > 0)
    ),
    errorCalls: apiEvents.filter(
      (event) => event.ok === false || (event.status ?? 200) >= 400
    ).length,
    interactions,
    pageViews,
  };
}

function buildRouteUsage(apiEvents: UsageEventRecord[]): RouteUsageSummary[] {
  const routeMap = new Map<
    string,
    { count: number; errorCount: number; durations: number[]; lastAt: string }
  >();

  for (const event of apiEvents) {
    const route = event.route ?? event.label;
    const current = routeMap.get(route) ?? {
      count: 0,
      durations: [],
      errorCount: 0,
      lastAt: event.at,
    };

    current.count += 1;
    current.errorCount +=
      event.ok === false || (event.status ?? 200) >= 400 ? 1 : 0;
    if (typeof event.durationMs === "number") {
      current.durations.push(event.durationMs);
    }
    if (event.at > current.lastAt) {
      current.lastAt = event.at;
    }

    routeMap.set(route, current);
  }

  return [...routeMap.entries()]
    .map(([route, value]) => ({
      avgDurationMs: average(value.durations),
      count: value.count,
      errorCount: value.errorCount,
      lastAt: value.lastAt,
      route,
    }))
    .toSorted(
      (left, right) =>
        right.count - left.count || right.lastAt.localeCompare(left.lastAt)
    )
    .slice(0, 6);
}

const activityLabels: [UsageEventRecord["kind"], string][] = [
  ["page_view", "views"],
  ["copy_prompt", "prompt copies"],
  ["copy_url", "link copies"],
  ["skill_save", "setup saves"],
  ["skill_refresh", "manual refreshes"],
  ["skill_import", "imports"],
  ["skill_create", "created skills"],
  ["automation_create", "automations"],
  ["agent_run", "agent runs"],
  ["search", "searches"],
];

function buildActivityCounts(events: UsageEventRecord[]) {
  return activityLabels
    .map(([kind, label]) => ({
      count: events.filter((event) => event.kind === kind).length,
      label,
    }))
    .filter((entry) => entry.count > 0)
    .slice(0, 6);
}

export interface BuildUsageOverviewOptions {
  /** Freeze time in tests; defaults to `new Date()`. */
  now?: Date;
  /** IANA timezone for calendar windows; default UTC. */
  timeZone?: string;
}

function buildVsPrior24hStrings(
  current: UsageTotalsSnapshot,
  baseline: UsageTotalsSnapshot
): UsageDeltaSet {
  return {
    apiCalls: formatVsPrior24hCount(current.apiCalls, baseline.apiCalls),
    avgApiDurationMs: formatVsPrior24hLatency(
      current.avgApiDurationMs,
      baseline.avgApiDurationMs
    ),
    interactions: formatVsPrior24hCount(
      current.interactions,
      baseline.interactions
    ),
    pageViews: formatVsPrior24hCount(current.pageViews, baseline.pageViews),
  };
}

function formatVsPrior24hCount(
  current: number,
  baseline: number
): string | null {
  if (baseline === 0 && current === 0) {
    return null;
  }
  if (baseline === 0) {
    return "↑ vs prior 24h";
  }
  const pct = Math.round(((current - baseline) / baseline) * 100);
  if (pct === 0) {
    return "Flat vs prior 24h";
  }
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs prior 24h`;
}

function formatVsPrior24hLatency(
  currentMs: number,
  baselineMs: number
): string | null {
  if (currentMs === 0 && baselineMs === 0) {
    return null;
  }
  if (baselineMs === 0 && currentMs > 0) {
    return "vs prior 24h";
  }
  if (baselineMs === 0) {
    return null;
  }
  if (currentMs === 0) {
    return "-100% avg vs prior 24h";
  }
  const pct = Math.round(((currentMs - baselineMs) / baselineMs) * 100);
  if (pct === 0) {
    return "Flat vs prior 24h";
  }
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% avg vs prior 24h`;
}

export function buildUsageOverview(
  events: UsageEventRecord[],
  options?: BuildUsageOverviewOptions
): UsageOverview {
  const now = options?.now ?? new Date();
  const timeZone = options?.timeZone ?? "UTC";
  const { start: rollStart, end: rollEnd } = rolling24hWindowEndInclusive(now);
  const rollingEvents = filterEventsInClosedRange(events, rollStart, rollEnd);
  const startToday = startOfDayInTimeZone(now, timeZone);
  const todayEvents = filterEventsInClosedRange(events, startToday, now);
  const { start: yStart, end: yEnd } = yesterdaySameClockWindow(now, timeZone);
  const yesterdayEvents = filterEventsInClosedRange(events, yStart, yEnd);

  const totals = computeUsageTotals(todayEvents);
  const totalsRolling24h = computeUsageTotals(rollingEvents);
  const yesterdayTotals = computeUsageTotals(yesterdayEvents);
  const vsYesterday = buildVsYesterdayStrings(totals, yesterdayTotals);

  const { start: pStart, end: pEnd } = prior24hWindowBeforeRolling(now);
  const priorRollingEvents = filterEventsInClosedRange(events, pStart, pEnd);
  const priorRollingTotals = computeUsageTotals(priorRollingEvents);
  const prior24h = buildVsPrior24hStrings(totalsRolling24h, priorRollingTotals);

  const timeSeries = bucketEventsByHour(rollingEvents, 24, now);
  const latencySeries = bucketLatencyByHour(rollingEvents, 24, now);
  const half = rollingHalfDeltas(timeSeries);
  const prior12h: UsageDeltaSet = {
    apiCalls: half.api,
    avgApiDurationMs: latencyHalfComparison(latencySeries),
    interactions: half.interactions,
    pageViews: half.views,
  };

  const comparisons: Record<UsageComparisonMode, UsageDeltaSet> = {
    prior_12h: prior12h,
    prior_24h: prior24h,
    yesterday_same_time: vsYesterday,
  };

  const tzShort = timeZone.replaceAll("_", " ");
  const comparisonFootnotes: Record<UsageComparisonMode, string> = {
    prior_12h: "Deltas: last 12h vs prior 12h, same rolling window.",
    prior_24h: "Deltas: last 24h vs the 24h before that.",
    yesterday_same_time: `Deltas vs same clock span yesterday (${tzShort}).`,
  };

  const apiRolling = rollingEvents.filter((e) => e.kind === "api_call");
  const routeUsage = buildRouteUsage(apiRolling);
  const activityCounts = buildActivityCounts(rollingEvents);
  const recentEvents = [...rollingEvents]
    .toSorted((left, right) => right.at.localeCompare(left.at))
    .slice(0, 12);

  return {
    activityCounts,
    comparisonFootnotes,
    comparisons,
    latencySeries,
    recentEvents,
    routeUsage,
    timeSeries,
    timeZone,
    totals,
    totalsRolling24h,
    vsYesterday,
  };
}

function buildDailyCounts(
  events: UsageEventRecord[],
  days: number
): SkillDailyCount[] {
  const now = new Date();
  const buckets = new Map<string, SkillDailyCount>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      apiCalls: 0,
      copies: 0,
      date: key,
      refreshes: 0,
      saves: 0,
      views: 0,
    });
  }

  for (const event of events) {
    const key = event.at.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) {
      continue;
    }

    switch (event.kind) {
      case "page_view": {
        bucket.views++;
        break;
      }
      case "copy_prompt":
      case "copy_url": {
        bucket.copies++;
        break;
      }
      case "skill_save": {
        bucket.saves++;
        break;
      }
      case "skill_refresh": {
        bucket.refreshes++;
        break;
      }
      case "api_call": {
        bucket.apiCalls++;
        break;
      }
    }
  }

  return [...buckets.values()];
}

export function buildSkillUsageSummary(
  skillSlug: string,
  events: UsageEventRecord[],
  loopRuns: LoopRunSummary[]
): SkillUsageSummary {
  const relevantEvents = events
    .filter(
      (event) =>
        event.skillSlug === skillSlug ||
        event.path?.includes(`/skills/${skillSlug}`)
    )
    .toSorted((left, right) => right.at.localeCompare(left.at));

  return {
    apiCalls: relevantEvents.filter((event) => event.kind === "api_call")
      .length,
    copies: relevantEvents.filter(
      (event) => event.kind === "copy_prompt" || event.kind === "copy_url"
    ).length,
    dailyCounts: buildDailyCounts(relevantEvents, 14),
    lastSeenAt: relevantEvents[0]?.at ?? null,
    pageViews: relevantEvents.filter((event) => event.kind === "page_view")
      .length,
    recentEvents: relevantEvents.slice(0, 8),
    refreshes: Math.max(
      relevantEvents.filter((event) => event.kind === "skill_refresh").length,
      loopRuns.filter((run) => run.slug === skillSlug).length
    ),
    saves: relevantEvents.filter((event) => event.kind === "skill_save").length,
  };
}
