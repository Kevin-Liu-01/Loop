import assert from "node:assert/strict";
import test from "node:test";

import {
  APP_NAV_LINKS,
  isLibraryPath,
  LIBRARY_PATH,
  MARKETING_NAV_LINKS,
  PUBLIC_HOME_PATH,
} from "@/lib/navigation";

test("public home and authenticated library keep distinct stable paths", () => {
  assert.equal(PUBLIC_HOME_PATH, "/home");
  assert.equal(LIBRARY_PATH, "/");
  assert.equal(isLibraryPath("/"), true);
  assert.equal(isLibraryPath("/home"), false);
  assert.equal(isLibraryPath("/skills/example"), false);
});

test("navigation sends marketing anchors home and app users to the library", () => {
  assert.deepEqual(APP_NAV_LINKS[0], { href: "/", label: "Library" });
  assert.deepEqual(MARKETING_NAV_LINKS.slice(0, 2), [
    { href: "/home#skills", label: "Skills" },
    { href: "/home#mcps", label: "Automations" },
  ]);
});
