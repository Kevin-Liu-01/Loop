import assert from "node:assert/strict";
import test from "node:test";

import {
  LOOP_GEAR_BODY_PATH,
  LOOP_GEAR_CHIP_PATH,
} from "@/lib/loop-logo-paths";

test("loop logo paths are stable non-empty SVG d strings", () => {
  assert.match(LOOP_GEAR_BODY_PATH, /^M[\d .A-Za-z,-]+Z$/);
  assert.match(LOOP_GEAR_CHIP_PATH, /^M[\d .A-Za-z,-]+Z$/);
  assert.ok(LOOP_GEAR_BODY_PATH.includes("103 76"));
  assert.ok(LOOP_GEAR_CHIP_PATH.startsWith("M96.28"));
  assert.ok(
    (LOOP_GEAR_CHIP_PATH.match(/A52 52/g) ?? []).length === 2,
    "chip has two outer arcs flanking the tooth"
  );
  assert.ok(
    LOOP_GEAR_CHIP_PATH.includes("A67 67"),
    "tooth tip arc sits on r=57 (beyond gear rim)"
  );
  assert.ok(
    (LOOP_GEAR_CHIP_PATH.match(/A42 42/g) ?? []).length === 3,
    "chip has two valley arcs + one closing inner arc"
  );
  assert.ok(
    !LOOP_GEAR_CHIP_PATH.includes("A28 28"),
    "chip must not include hub-hole arcs (annulus only)"
  );
});
