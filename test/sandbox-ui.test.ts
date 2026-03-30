import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sandboxToolbarControl, sandboxToolbarLabel } from "@/lib/sandbox-ui";

describe("sandbox-ui tokens", () => {
  it("exports toolbar class strings", () => {
    assert.ok(sandboxToolbarControl.includes("rounded-xl"));
    assert.ok(sandboxToolbarLabel.includes("uppercase"));
  });
});
