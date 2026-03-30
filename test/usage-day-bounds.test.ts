process.env.TZ = "UTC";

import test from "node:test";
import assert from "node:assert/strict";

import {
  filterEventsInClosedRange,
  prior24hWindowBeforeRolling,
  rolling24hWindowEndInclusive,
  startOfDayInTimeZone,
  usageEventsSinceIsoForOverview,
  yesterdaySameClockWindow,
} from "@/lib/usage-day-bounds";

test("startOfDayInTimeZone UTC", () => {
  const d = new Date(Date.UTC(2024, 5, 11, 15, 30, 0));
  assert.equal(startOfDayInTimeZone(d, "UTC").toISOString(), "2024-06-11T00:00:00.000Z");
});

test("yesterdaySameClockWindow mirrors span from midnight today in zone", () => {
  const now = new Date(Date.UTC(2024, 5, 11, 15, 0, 0));
  const { start, end } = yesterdaySameClockWindow(now, "UTC");
  assert.equal(start.toISOString(), "2024-06-10T00:00:00.000Z");
  assert.equal(end.toISOString(), "2024-06-10T15:00:00.000Z");
});

test("rolling24hWindowEndInclusive is 24h ending at now", () => {
  const now = new Date(Date.UTC(2024, 5, 11, 15, 0, 0));
  const { start, end } = rolling24hWindowEndInclusive(now);
  assert.equal(end.toISOString(), now.toISOString());
  assert.equal(start.toISOString(), "2024-06-10T15:00:00.000Z");
});

test("prior24hWindowBeforeRolling", () => {
  const now = new Date(Date.UTC(2024, 5, 11, 15, 0, 0));
  const { start, end } = prior24hWindowBeforeRolling(now);
  assert.equal(end.toISOString(), "2024-06-10T15:00:00.000Z");
  assert.equal(start.toISOString(), "2024-06-09T15:00:00.000Z");
});

test("filterEventsInClosedRange is inclusive on both ends", () => {
  const events: Array<{ at: string; k: number }> = [
    { at: "2024-06-10T00:00:00.000Z", k: 1 },
    { at: "2024-06-10T15:00:00.000Z", k: 2 },
  ];
  const a = new Date("2024-06-10T00:00:00.000Z");
  const b = new Date("2024-06-10T15:00:00.000Z");
  const got = filterEventsInClosedRange(events, a, b);
  assert.equal(got.length, 2);
});

test("usageEventsSinceIsoForOverview starts at yesterday midnight in zone", () => {
  const now = new Date(Date.UTC(2024, 5, 11, 8, 0, 0));
  assert.equal(usageEventsSinceIsoForOverview(now, "UTC"), "2024-06-10T00:00:00.000Z");
});
