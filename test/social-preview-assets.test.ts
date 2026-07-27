import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import robots from "../app/robots";
import { DEFAULT_OG_IMAGE_PATH } from "../lib/seo";

const README_PATH = new URL("../README.md", import.meta.url);

test("Twitterbot can fetch both requested and deployed Open Graph paths", () => {
  const { rules } = robots();

  assert.ok(Array.isArray(rules), "Crawler rules should be explicit groups");
  const twitterRule = rules.find((rule) => rule.userAgent === "Twitterbot");

  assert.deepEqual(twitterRule?.allow, [
    "/api/og",
    "/api/og-home",
    "/og",
    "/og.png",
    "/og-v2.png",
    "/og-v3.png",
  ]);
  assert.equal(DEFAULT_OG_IMAGE_PATH, "/og-v3.png");
});

test("README uses the same versioned Loop social image", async () => {
  const readme = await readFile(README_PATH, "utf-8");

  assert.match(readme, /src="https:\/\/loooop\.dev\/og-v3\.png"/);
});
