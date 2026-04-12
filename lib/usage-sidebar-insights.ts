import type { LatencyBucket, TimeSeriesBucket } from "@/lib/usage-charts";

export function sumBucketTotals(series: TimeSeriesBucket[]): number {
  return series.reduce((acc, b) => acc + b.total, 0);
}

export function peakVolumeHour(
  series: TimeSeriesBucket[]
): { label: string; count: number } | null {
  if (series.length === 0) {
    return null;
  }
  let best = series[0]!;
  for (const b of series) {
    if (b.total > best.total) {
      best = b;
    }
  }
  if (best.total === 0) {
    return null;
  }
  return { count: best.total, label: best.label };
}

function splitHalf<T>(items: T[]): { first: T[]; second: T[] } {
  if (items.length === 0) {
    return { first: [], second: [] };
  }
  const mid = Math.floor(items.length / 2);
  return { first: items.slice(0, mid), second: items.slice(mid) };
}

export function sumViews(series: TimeSeriesBucket[]): number {
  return series.reduce((acc, b) => acc + b.views, 0);
}

export function sumInteractions(series: TimeSeriesBucket[]): number {
  return series.reduce((acc, b) => acc + b.interactions, 0);
}

export function sumApi(series: TimeSeriesBucket[]): number {
  return series.reduce((acc, b) => acc + b.api, 0);
}

export function formatRollingHalfDelta(
  prev: number,
  next: number
): string | null {
  if (prev === 0 && next === 0) {
    return null;
  }
  if (prev === 0 && next > 0) {
    return "↑ vs prior 12h";
  }
  const pct = Math.round(((next - prev) / prev) * 100);
  if (pct === 0) {
    return "Flat vs prior 12h";
  }
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs prior 12h`;
}

export function rollingHalfDeltas(series: TimeSeriesBucket[]): {
  views: string | null;
  interactions: string | null;
  api: string | null;
} {
  const { first, second } = splitHalf(series);
  return {
    api: formatRollingHalfDelta(sumApi(first), sumApi(second)),
    interactions: formatRollingHalfDelta(
      sumInteractions(first),
      sumInteractions(second)
    ),
    views: formatRollingHalfDelta(sumViews(first), sumViews(second)),
  };
}

export function latencyHalfComparison(latency: LatencyBucket[]): string | null {
  const { first, second } = splitHalf(latency);
  const avg = (chunk: LatencyBucket[]) => {
    const withData = chunk.filter((b) => b.avgMs > 0);
    if (withData.length === 0) {
      return 0;
    }
    return Math.round(
      withData.reduce((s, b) => s + b.avgMs, 0) / withData.length
    );
  };
  const a = avg(first);
  const b = avg(second);
  if (a === 0 && b === 0) {
    return null;
  }
  if (a === 0 && b > 0) {
    return "Latency in later 12h";
  }
  if (b === 0 && a > 0) {
    return "Latency in earlier 12h";
  }
  const pct = Math.round(((b - a) / a) * 100);
  if (pct === 0) {
    return "Flat vs prior 12h";
  }
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% avg ms vs prior 12h`;
}
