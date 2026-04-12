import assert from "node:assert/strict";
import test from "node:test";

import { supportsSandboxMcp } from "@/lib/mcp-utils";

test("supportsSandboxMcp respects explicit sandbox support flags", () => {
  assert.equal(
    supportsSandboxMcp({
      sandboxSupported: false,
      transport: "stdio",
    }),
    false
  );

  assert.equal(
    supportsSandboxMcp({
      sandboxSupported: true,
      transport: "ws",
    }),
    true
  );
});

test("supportsSandboxMcp falls back to executable transports when unset", () => {
  assert.equal(
    supportsSandboxMcp({
      transport: "stdio",
    }),
    true
  );

  assert.equal(
    supportsSandboxMcp({
      transport: "http",
    }),
    true
  );

  assert.equal(
    supportsSandboxMcp({
      transport: "sse",
    }),
    false
  );
});
