import assert from "node:assert/strict";
import test from "node:test";

import { GA_MEASUREMENT_ID, isAnalyticsPath } from "@/lib/analytics";

test("GA measurement ID is a GA4 web stream ID", () => {
  assert.match(GA_MEASUREMENT_ID, /^G-[A-Z0-9]{10}$/);
});

test("public marketing and catalog pages are measured", () => {
  for (const pathname of [
    "/home",
    "/faq",
    "/privacy",
    "/terms",
    "/skills/frontend-design",
    "/skills/frontend-design/v3",
    "/mcps/github",
  ]) {
    assert.equal(isAnalyticsPath(pathname), true, pathname);
  }
});

test("signed-in surfaces and auth pages are never measured", () => {
  for (const pathname of [
    "/",
    "/settings",
    "/settings/branding",
    "/sandbox",
    "/signed-in/skills/frontend-design/v3",
    "/sign-in",
    "/sign-in/factor-one",
    "/sign-up",
  ]) {
    assert.equal(isAnalyticsPath(pathname), false, pathname);
  }
});

test("untracked prefixes match whole path segments only", () => {
  assert.equal(isAnalyticsPath("/settings-guide"), true);
  assert.equal(isAnalyticsPath("/sandboxes"), true);
});
