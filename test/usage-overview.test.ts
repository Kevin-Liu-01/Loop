process.env.TZ = "UTC";

import assert from "node:assert/strict";
import test from "node:test";

import type { UsageEventRecord } from "@/lib/types";
import { buildUsageOverview, computeUsageTotals } from "@/lib/usage";

function ev(
  iso: string,
  kind: UsageEventRecord["kind"],
  extra?: Partial<UsageEventRecord>
): UsageEventRecord {
  return {
    at: iso,
    id: `${iso}-${kind}`,
    kind,
    label: kind,
    source: "ui",
    ...extra,
  };
}

test("computeUsageTotals splits kinds", () => {
  const events = [
    ev("2024-06-11T10:00:00.000Z", "page_view"),
    ev("2024-06-11T10:01:00.000Z", "api_call", {
      durationMs: 10,
      ok: true,
      status: 200,
    }),
    ev("2024-06-11T10:02:00.000Z", "search"),
  ];
  const t = computeUsageTotals(events);
  assert.equal(t.pageViews, 1);
  assert.equal(t.apiCalls, 1);
  assert.equal(t.interactions, 1);
  assert.equal(t.errorCalls, 0);
});

test("buildUsageOverview windows: today vs yesterday vs rolling", () => {
  const now = new Date(Date.UTC(2024, 5, 11, 15, 0, 0));
  const events = [
    ev("2024-06-10T14:00:00.000Z", "page_view"),
    ev("2024-06-10T20:00:00.000Z", "page_view"),
    ev("2024-06-11T10:00:00.000Z", "page_view"),
    ev("2024-06-11T14:00:00.000Z", "page_view"),
    ev("2024-06-10T16:00:00.000Z", "page_view"),
  ];

  const o = buildUsageOverview(events, { now, timeZone: "UTC" });

  assert.equal(o.timeZone, "UTC");
  assert.equal(o.totals.pageViews, 2, "today 00–15h");
  assert.equal(
    o.totalsRolling24h.pageViews,
    4,
    "rolling from 10 Jun 15:00 through now"
  );
  assert.equal(o.vsYesterday.pageViews, "+100% vs y'day same time");
  assert.equal(
    o.comparisons.yesterday_same_time.pageViews,
    "+100% vs y'day same time"
  );

  const sumRolling = o.timeSeries.reduce((s, b) => s + b.total, 0);
  assert.equal(
    sumRolling,
    o.totalsRolling24h.pageViews +
      o.totalsRolling24h.interactions +
      o.totalsRolling24h.apiCalls
  );
});
