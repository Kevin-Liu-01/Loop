import test from "node:test";
import assert from "node:assert/strict";

import {
  buildVsYesterdayStrings,
  formatVsYesterdayCount,
  formatVsYesterdayLatency,
} from "@/lib/usage-vs-yesterday";

test("formatVsYesterdayCount", () => {
  assert.equal(formatVsYesterdayCount(0, 0), null);
  assert.equal(formatVsYesterdayCount(5, 0), "↑ vs y'day same time");
  assert.equal(formatVsYesterdayCount(10, 10), "Flat vs y'day same time");
  assert.equal(formatVsYesterdayCount(15, 10), "+50% vs y'day same time");
  assert.equal(formatVsYesterdayCount(5, 10), "-50% vs y'day same time");
});

test("formatVsYesterdayLatency handles zero baseline with current", () => {
  assert.equal(formatVsYesterdayLatency(100, 0), "vs y'day same time");
});

test("formatVsYesterdayLatency handles zero current with baseline", () => {
  assert.equal(formatVsYesterdayLatency(0, 120), "-100% avg vs y'day same time");
});

test("buildVsYesterdayStrings aggregates fields", () => {
  const s = buildVsYesterdayStrings(
    { pageViews: 10, interactions: 2, apiCalls: 4, avgApiDurationMs: 100 },
    { pageViews: 5, interactions: 2, apiCalls: 4, avgApiDurationMs: 50 }
  );
  assert.equal(s.pageViews, "+100% vs y'day same time");
  assert.equal(s.interactions, "Flat vs y'day same time");
  assert.equal(s.apiCalls, "Flat vs y'day same time");
  assert.equal(s.avgApiDurationMs, "+100% avg vs y'day same time");
});
