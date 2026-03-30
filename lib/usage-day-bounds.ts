import { startOfDay, subDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

/**
 * UTC instant for calendar midnight of `now` in `timeZone` (IANA), e.g. America/New_York.
 */
export function startOfDayInTimeZone(now: Date, timeZone: string): Date {
  const zoned = toZonedTime(now, timeZone);
  const sod = startOfDay(zoned);
  return fromZonedTime(sod, timeZone);
}

/** Inclusive of `now` for “today so far”; use with `filterEventsInClosedRange`. */
export function rolling24hWindowEndInclusive(now: Date): { start: Date; end: Date } {
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return { start, end: now };
}

/**
 * Same wall-clock span as [midnight today in zone, now], shifted back one calendar day in that zone.
 * Inclusive on both ends for event timestamps.
 */
export function yesterdaySameClockWindow(now: Date, timeZone: string): { start: Date; end: Date } {
  const startToday = startOfDayInTimeZone(now, timeZone);
  const zonedNow = toZonedTime(now, timeZone);
  const zonedYesterdayMidnight = startOfDay(subDays(zonedNow, 1));
  const startYesterday = fromZonedTime(zonedYesterdayMidnight, timeZone);
  const spanMs = now.getTime() - startToday.getTime();
  const end = new Date(startYesterday.getTime() + spanMs);
  return { start: startYesterday, end };
}

/** Previous contiguous 24h window immediately before the rolling window ending at `now`. */
export function prior24hWindowBeforeRolling(now: Date): { start: Date; end: Date } {
  const end = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const start = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  return { start, end };
}

/** ISO lower bound for DB fetch: start of yesterday in `timeZone` (includes all of yesterday + today in that zone). */
export function usageEventsSinceIsoForOverview(now: Date, timeZone: string): string {
  const zonedNow = toZonedTime(now, timeZone);
  const zonedYesterdayStart = startOfDay(subDays(zonedNow, 1));
  const startYesterdayUtc = fromZonedTime(zonedYesterdayStart, timeZone);
  return startYesterdayUtc.toISOString();
}

export function filterEventsInClosedRange<T extends { at: string }>(
  events: T[],
  start: Date,
  end: Date
): T[] {
  const a = start.getTime();
  const b = end.getTime();
  return events.filter((e) => {
    const t = new Date(e.at).getTime();
    return t >= a && t <= b;
  });
}
