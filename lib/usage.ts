import type { LoopRunRecord, UsageEventRecord } from "@/lib/types";
import {
  filterEventsInClosedRange,
  prior24hWindowBeforeRolling,
  rolling24hWindowEndInclusive,
  startOfDayInTimeZone,
  yesterdaySameClockWindow,
} from "@/lib/usage-day-bounds";
import type { UsageComparisonMode } from "@/lib/usage-comparison-modes";
import { buildVsYesterdayStrings } from "@/lib/usage-vs-yesterday";
import {
  latencyHalfComparison,
  rollingHalfDeltas,
} from "@/lib/usage-sidebar-insights";
import {
  bucketEventsByHour,
  bucketLatencyByHour,
  type LatencyBucket,
  type TimeSeriesBucket,
} from "@/lib/usage-charts";

export type RouteUsageSummary = {
  route: string;
  count: number;
  errorCount: number;
  avgDurationMs: number;
  lastAt: string;
};

export type UsageTotalsSnapshot = {
  pageViews: number;
  interactions: number;
  apiCalls: number;
  errorCalls: number;
  avgApiDurationMs: number;
};

export type UsageDeltaSet = {
  pageViews: string | null;
  interactions: string | null;
  apiCalls: string | null;
  avgApiDurationMs: string | null;
};

/** @deprecated Use `comparisons.yesterday_same_time` */
export type VsYesterdaySameTime = UsageDeltaSet;

export type UsageOverview = {
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
  activityCounts: Array<{
    label: string;
    count: number;
  }>;
};

export type SkillDailyCount = {
  date: string;
  views: number;
  copies: number;
  saves: number;
  refreshes: number;
  apiCalls: number;
};

export type SkillUsageSummary = {
  pageViews: number;
  copies: number;
  saves: number;
  refreshes: number;
  apiCalls: number;
  lastSeenAt: string | null;
  recentEvents: UsageEventRecord[];
  dailyCounts: SkillDailyCount[];
};

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
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
  if (mode === "yesterday_same_time") return overview.totals;
  return overview.totalsRolling24h;
}

export function computeUsageTotals(events: UsageEventRecord[]): UsageTotalsSnapshot {
  const pageViews = events.filter((event) => event.kind === "page_view").length;
  const apiEvents = events.filter((event) => event.kind === "api_call");
  const interactions = events.length - pageViews - apiEvents.length;
  return {
    pageViews,
    interactions,
    apiCalls: apiEvents.length,
    errorCalls: apiEvents.filter((event) => event.ok === false || (event.status ?? 200) >= 400).length,
    avgApiDurationMs: average(apiEvents.map((event) => event.durationMs ?? 0).filter((value) => value > 0)),
  };
}

function buildRouteUsage(apiEvents: UsageEventRecord[]): RouteUsageSummary[] {
  const routeMap = new Map<string, { count: number; errorCount: number; durations: number[]; lastAt: string }>();

  for (const event of apiEvents) {
    const route = event.route ?? event.label;
    const current = routeMap.get(route) ?? {
      count: 0,
      errorCount: 0,
      durations: [],
      lastAt: event.at,
    };

    current.count += 1;
    current.errorCount += event.ok === false || (event.status ?? 200) >= 400 ? 1 : 0;
    if (typeof event.durationMs === "number") {
      current.durations.push(event.durationMs);
    }
    if (event.at > current.lastAt) {
      current.lastAt = event.at;
    }

    routeMap.set(route, current);
  }

  return Array.from(routeMap.entries())
    .map(([route, value]) => ({
      route,
      count: value.count,
      errorCount: value.errorCount,
      avgDurationMs: average(value.durations),
      lastAt: value.lastAt,
    }))
    .sort((left, right) => right.count - left.count || right.lastAt.localeCompare(left.lastAt))
    .slice(0, 6);
}

const activityLabels: Array<[UsageEventRecord["kind"], string]> = [
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
      label,
      count: events.filter((event) => event.kind === kind).length,
    }))
    .filter((entry) => entry.count > 0)
    .slice(0, 6);
}

export type BuildUsageOverviewOptions = {
  /** Freeze time in tests; defaults to `new Date()`. */
  now?: Date;
  /** IANA timezone for calendar windows; default UTC. */
  timeZone?: string;
};

function buildVsPrior24hStrings(
  current: UsageTotalsSnapshot,
  baseline: UsageTotalsSnapshot
): UsageDeltaSet {
  return {
    pageViews: formatVsPrior24hCount(current.pageViews, baseline.pageViews),
    interactions: formatVsPrior24hCount(current.interactions, baseline.interactions),
    apiCalls: formatVsPrior24hCount(current.apiCalls, baseline.apiCalls),
    avgApiDurationMs: formatVsPrior24hLatency(current.avgApiDurationMs, baseline.avgApiDurationMs),
  };
}

function formatVsPrior24hCount(current: number, baseline: number): string | null {
  if (baseline === 0 && current === 0) return null;
  if (baseline === 0) return "↑ vs prior 24h";
  const pct = Math.round(((current - baseline) / baseline) * 100);
  if (pct === 0) return "Flat vs prior 24h";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs prior 24h`;
}

function formatVsPrior24hLatency(currentMs: number, baselineMs: number): string | null {
  if (currentMs === 0 && baselineMs === 0) return null;
  if (baselineMs === 0 && currentMs > 0) return "vs prior 24h";
  if (baselineMs === 0) return null;
  if (currentMs === 0) return "-100% avg vs prior 24h";
  const pct = Math.round(((currentMs - baselineMs) / baselineMs) * 100);
  if (pct === 0) return "Flat vs prior 24h";
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
    pageViews: half.views,
    interactions: half.interactions,
    apiCalls: half.api,
    avgApiDurationMs: latencyHalfComparison(latencySeries),
  };

  const comparisons: Record<UsageComparisonMode, UsageDeltaSet> = {
    yesterday_same_time: vsYesterday,
    prior_24h: prior24h,
    prior_12h: prior12h,
  };

  const tzShort = timeZone.replace(/_/g, " ");
  const comparisonFootnotes: Record<UsageComparisonMode, string> = {
    yesterday_same_time: `Deltas vs same clock span yesterday (${tzShort}).`,
    prior_24h: "Deltas: last 24h vs the 24h before that.",
    prior_12h: "Deltas: last 12h vs prior 12h, same rolling window.",
  };

  const apiRolling = rollingEvents.filter((e) => e.kind === "api_call");
  const routeUsage = buildRouteUsage(apiRolling);
  const activityCounts = buildActivityCounts(rollingEvents);
  const recentEvents = rollingEvents
    .slice()
    .sort((left, right) => right.at.localeCompare(left.at))
    .slice(0, 12);

  return {
    timeZone,
    totals,
    totalsRolling24h,
    vsYesterday,
    comparisons,
    comparisonFootnotes,
    timeSeries,
    latencySeries,
    routeUsage,
    recentEvents,
    activityCounts,
  };
}

function buildDailyCounts(events: UsageEventRecord[], days: number): SkillDailyCount[] {
  const now = new Date();
  const buckets = new Map<string, SkillDailyCount>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, views: 0, copies: 0, saves: 0, refreshes: 0, apiCalls: 0 });
  }

  for (const event of events) {
    const key = event.at.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;

    switch (event.kind) {
      case "page_view":
        bucket.views++;
        break;
      case "copy_prompt":
      case "copy_url":
        bucket.copies++;
        break;
      case "skill_save":
        bucket.saves++;
        break;
      case "skill_refresh":
        bucket.refreshes++;
        break;
      case "api_call":
        bucket.apiCalls++;
        break;
    }
  }

  return Array.from(buckets.values());
}

export function buildSkillUsageSummary(
  skillSlug: string,
  events: UsageEventRecord[],
  loopRuns: LoopRunRecord[]
): SkillUsageSummary {
  const relevantEvents = events
    .filter((event) => event.skillSlug === skillSlug || event.path?.includes(`/skills/${skillSlug}`))
    .sort((left, right) => right.at.localeCompare(left.at));

  return {
    pageViews: relevantEvents.filter((event) => event.kind === "page_view").length,
    copies: relevantEvents.filter((event) => event.kind === "copy_prompt" || event.kind === "copy_url").length,
    saves: relevantEvents.filter((event) => event.kind === "skill_save").length,
    refreshes: Math.max(
      relevantEvents.filter((event) => event.kind === "skill_refresh").length,
      loopRuns.filter((run) => run.slug === skillSlug).length
    ),
    apiCalls: relevantEvents.filter((event) => event.kind === "api_call").length,
    lastSeenAt: relevantEvents[0]?.at ?? null,
    recentEvents: relevantEvents.slice(0, 8),
    dailyCounts: buildDailyCounts(relevantEvents, 14),
  };
}
