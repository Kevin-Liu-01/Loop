import assert from "node:assert/strict";
import test from "node:test";

import type { LatencyBucket, TimeSeriesBucket } from "@/lib/usage-charts";
import {
  formatRollingHalfDelta,
  latencyHalfComparison,
  peakVolumeHour,
  rollingHalfDeltas,
  sumBucketTotals,
} from "@/lib/usage-sidebar-insights";

function bucket(
  partial: Partial<TimeSeriesBucket> & Pick<TimeSeriesBucket, "label">
): TimeSeriesBucket {
  return {
    api: partial.api ?? 0,
    bucket: partial.bucket ?? "",
    interactions: partial.interactions ?? 0,
    label: partial.label,
    total: partial.total ?? 0,
    views: partial.views ?? 0,
  };
}

test("sumBucketTotals sums hour totals", () => {
  const s: TimeSeriesBucket[] = [
    bucket({ label: "1a", total: 2 }),
    bucket({ label: "2a", total: 3 }),
  ];
  assert.equal(sumBucketTotals(s), 5);
});

test("peakVolumeHour returns max bucket", () => {
  const s: TimeSeriesBucket[] = [
    bucket({ label: "1a", total: 1 }),
    bucket({ label: "2p", total: 9 }),
    bucket({ label: "3p", total: 4 }),
  ];
  assert.deepEqual(peakVolumeHour(s), { count: 9, label: "2p" });
});

test("peakVolumeHour returns null when all zero", () => {
  const s: TimeSeriesBucket[] = [bucket({ label: "1a", total: 0 })];
  assert.equal(peakVolumeHour(s), null);
});

test("formatRollingHalfDelta handles edges", () => {
  assert.equal(formatRollingHalfDelta(0, 0), null);
  assert.equal(formatRollingHalfDelta(0, 5), "↑ vs prior 12h");
  assert.equal(formatRollingHalfDelta(10, 10), "Flat vs prior 12h");
  assert.equal(formatRollingHalfDelta(10, 15), "+50% vs prior 12h");
  assert.equal(formatRollingHalfDelta(10, 5), "-50% vs prior 12h");
});

test("rollingHalfDeltas compares halves of 24 buckets", () => {
  const s: TimeSeriesBucket[] = Array.from({ length: 24 }, (_, i) =>
    bucket({
      api: 0,
      interactions: 0,
      label: `${i}`,
      total: i < 12 ? 1 : 3,
      views: i < 12 ? 1 : 3,
    })
  );
  const d = rollingHalfDeltas(s);
  assert.equal(d.views, "+200% vs prior 12h");
});

test("latencyHalfComparison compares averaged halves", () => {
  const early: LatencyBucket[] = Array.from({ length: 12 }, (_, i) => ({
    avgMs: 100,
    bucket: "",
    label: `${i}`,
    maxMs: 100,
  }));
  const late: LatencyBucket[] = Array.from({ length: 12 }, (_, i) => ({
    avgMs: 200,
    bucket: "",
    label: `${i + 12}`,
    maxMs: 200,
  }));
  assert.equal(
    latencyHalfComparison([...early, ...late]),
    "+100% avg ms vs prior 12h"
  );
});
