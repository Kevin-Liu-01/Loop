import type { UsageEventRecord } from "@/lib/types";

export type TimeSeriesBucket = {
  bucket: string;
  label: string;
  total: number;
  api: number;
  views: number;
  interactions: number;
};

export type LatencyBucket = {
  bucket: string;
  label: string;
  avgMs: number;
  maxMs: number;
};

function formatHourLabel(date: Date): string {
  const h = date.getHours();
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function averageOf(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export function bucketEventsByHour(
  events: UsageEventRecord[],
  hours = 24,
  nowInput?: Date
): TimeSeriesBucket[] {
  const now = nowInput ?? new Date();
  const buckets: TimeSeriesBucket[] = [];

  for (let i = hours - 1; i >= 0; i--) {
    const start = new Date(now);
    start.setHours(now.getHours() - i, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    const startIso = start.getTime();
    const endIso = end.getTime();

    const matches = events.filter((e) => {
      const t = new Date(e.at).getTime();
      return t >= startIso && t < endIso;
    });

    const api = matches.filter((e) => e.kind === "api_call").length;
    const views = matches.filter((e) => e.kind === "page_view").length;

    buckets.push({
      bucket: start.toISOString(),
      label: formatHourLabel(start),
      total: matches.length,
      api,
      views,
      interactions: matches.length - api - views,
    });
  }

  return buckets;
}

export function bucketLatencyByHour(
  events: UsageEventRecord[],
  hours = 24,
  nowInput?: Date
): LatencyBucket[] {
  const now = nowInput ?? new Date();
  const apiEvents = events.filter(
    (e) => e.kind === "api_call" && typeof e.durationMs === "number"
  );
  const buckets: LatencyBucket[] = [];

  for (let i = hours - 1; i >= 0; i--) {
    const start = new Date(now);
    start.setHours(now.getHours() - i, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    const startIso = start.getTime();
    const endIso = end.getTime();

    const matches = apiEvents.filter((e) => {
      const t = new Date(e.at).getTime();
      return t >= startIso && t < endIso;
    });

    const durations = matches.map((e) => e.durationMs!);

    buckets.push({
      bucket: start.toISOString(),
      label: formatHourLabel(start),
      avgMs: averageOf(durations),
      maxMs: durations.length > 0 ? Math.max(...durations) : 0,
    });
  }

  return buckets;
}
