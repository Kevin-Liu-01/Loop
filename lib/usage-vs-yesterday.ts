export function formatVsYesterdayCount(current: number, baseline: number): string | null {
  if (baseline === 0 && current === 0) return null;
  if (baseline === 0) return "↑ vs y'day same time";
  const pct = Math.round(((current - baseline) / baseline) * 100);
  if (pct === 0) return "Flat vs y'day same time";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs y'day same time`;
}

export function formatVsYesterdayLatency(currentMs: number, baselineMs: number): string | null {
  if (currentMs === 0 && baselineMs === 0) return null;
  if (baselineMs === 0 && currentMs > 0) return "vs y'day same time";
  if (baselineMs === 0) return null;
  if (currentMs === 0) return "-100% avg vs y'day same time";
  const pct = Math.round(((currentMs - baselineMs) / baselineMs) * 100);
  if (pct === 0) return "Flat vs y'day same time";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% avg vs y'day same time`;
}

export function buildVsYesterdayStrings(
  today: { pageViews: number; interactions: number; apiCalls: number; avgApiDurationMs: number },
  yesterday: { pageViews: number; interactions: number; apiCalls: number; avgApiDurationMs: number }
): {
  pageViews: string | null;
  interactions: string | null;
  apiCalls: string | null;
  avgApiDurationMs: string | null;
} {
  return {
    pageViews: formatVsYesterdayCount(today.pageViews, yesterday.pageViews),
    interactions: formatVsYesterdayCount(today.interactions, yesterday.interactions),
    apiCalls: formatVsYesterdayCount(today.apiCalls, yesterday.apiCalls),
    avgApiDurationMs: formatVsYesterdayLatency(today.avgApiDurationMs, yesterday.avgApiDurationMs),
  };
}
