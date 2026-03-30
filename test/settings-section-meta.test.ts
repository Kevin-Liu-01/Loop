import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SETTINGS_NAV_ITEMS } from "@/lib/settings-nav";
import { SETTINGS_SECTION_META } from "@/lib/settings-section-meta";

describe("SETTINGS_SECTION_META", () => {
  it("defines copy for every settings nav id", () => {
    for (const item of SETTINGS_NAV_ITEMS) {
      const meta = SETTINGS_SECTION_META[item.id];
      assert.ok(meta, `missing meta for ${item.id}`);
      assert.ok(meta.heading.trim().length > 0);
      assert.ok(meta.lead.trim().length > 0);
      assert.ok(meta.beforePrimary.length > 0);
      assert.ok(meta.afterPrimary.length > 0);
      for (const block of [...meta.beforePrimary, ...meta.afterPrimary]) {
        assert.ok(block.title.trim().length > 0);
        assert.ok(block.body.trim().length > 0);
      }
    }
  });
});
