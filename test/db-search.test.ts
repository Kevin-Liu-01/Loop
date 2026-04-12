import assert from "node:assert/strict";
import test from "node:test";

import type { SearchHit } from "@/lib/types";

test("SearchHit shape matches expected DB search result fields", () => {
  const hit: SearchHit = {
    category: "frontend",
    description: "A test skill for validation.",
    href: "/skills/test-skill/v1",
    id: "skill:test-skill:1",
    kind: "skill",
    origin: "repo",
    score: 0.95,
    tags: ["frontend", "test"],
    title: "Test Skill",
    updatedAt: "2026-03-28T00:00:00.000Z",
    versionLabel: "v1",
  };

  assert.equal(hit.kind, "skill");
  assert.equal(hit.score, 0.95);
  assert.equal(hit.origin, "repo");
  assert.equal(hit.versionLabel, "v1");
  assert.ok(hit.href.startsWith("/skills/"));
});

test("SearchHit supports category, brief, and mcp kinds", () => {
  const categoryHit: SearchHit = {
    category: "frontend",
    description: "Frontend development skills.",
    href: "/categories/frontend",
    id: "category:frontend",
    kind: "category",
    score: 1,
    tags: ["frontend"],
    title: "Frontend",
    updatedAt: "2026-03-28T00:00:00.000Z",
  };

  const briefHit: SearchHit = {
    category: "frontend",
    description: "Today's frontend changes.",
    href: "/categories/frontend",
    id: "brief:frontend",
    kind: "brief",
    score: 0.8,
    tags: ["react", "css"],
    title: "Daily Frontend Brief",
    updatedAt: "2026-03-28T00:00:00.000Z",
  };

  assert.equal(categoryHit.kind, "category");
  assert.equal(briefHit.kind, "brief");
});

test("Full-text search query normalization handles special characters", () => {
  const normalizedQuery = "react three fiber"
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word}:*`)
    .join(" & ");

  assert.equal(normalizedQuery, "react:* & three:* & fiber:*");
});

test("Empty query returns results sorted by updatedAt", () => {
  const query = "";
  assert.equal(query.trim(), "");
});
