import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { modalDialogContentSurface, modalDialogOverlay } from "@/lib/modal-dialog";

describe("modal-dialog tokens", () => {
  it("exports non-empty surface and overlay class strings", () => {
    assert.ok(modalDialogContentSurface.length > 20);
    assert.ok(modalDialogOverlay.length > 10);
    assert.match(modalDialogContentSurface, /shadow-/);
    assert.match(modalDialogOverlay, /backdrop-blur/);
  });
});
