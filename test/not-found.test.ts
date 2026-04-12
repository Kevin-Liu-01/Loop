import assert from "node:assert/strict";
import test from "node:test";

import {
  NOT_FOUND_PAGE_DESCRIPTION,
  NOT_FOUND_PAGE_TITLE,
} from "@/lib/not-found";

test("not-found copy is non-empty and stable for metadata", () => {
  assert.equal(typeof NOT_FOUND_PAGE_TITLE, "string");
  assert.ok(NOT_FOUND_PAGE_TITLE.length > 0);
  assert.equal(typeof NOT_FOUND_PAGE_DESCRIPTION, "string");
  assert.ok(NOT_FOUND_PAGE_DESCRIPTION.length > 0);
});
