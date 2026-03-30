import assert from "node:assert/strict";
import test from "node:test";

import { parallaxOffsetPx } from "@/lib/home-landing/landing-parallax";

test("parallaxOffsetPx clamps progress and scales by depth", () => {
  assert.equal(parallaxOffsetPx(0, 0.5, 100), 0);
  assert.equal(parallaxOffsetPx(1, 0.5, 100), 50);
  assert.equal(parallaxOffsetPx(0.5, -0.25, 200), -25);
});

test("parallaxOffsetPx clamps progress outside 0..1", () => {
  assert.equal(parallaxOffsetPx(-1, 1, 50), 0);
  assert.equal(parallaxOffsetPx(2, 1, 50), 50);
});
