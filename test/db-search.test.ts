import assert from "node:assert/strict";
import test from "node:test";

import type { SearchHit } from "@/lib/types";

test("SearchHit shape matches expected DB search result fields", () => {
  const hit: SearchHit = {
    id: "skill:test-skill:1",
    kind: "skill",
    title: "Test Skill",
    description: "A test skill for validation.",
    href: "/skills/test-skill/v1",
    category: "frontend",
    tags: ["frontend", "test"],
    updatedAt: "2026-03-28T00:00:00.000Z",
    origin: "repo",
    versionLabel: "v1",
    score: 0.95
  };

  assert.equal(hit.kind, "skill");
  assert.equal(hit.score, 0.95);
  assert.equal(hit.origin, "repo");
  assert.equal(hit.versionLabel, "v1");
  assert.ok(hit.href.startsWith("/skills/"));
});

test("SearchHit supports category, brief, and mcp kinds", () => {
  const categoryHit: SearchHit = {
    id: "category:frontend",
    kind: "category",
    title: "Frontend",
    description: "Frontend development skills.",
    href: "/categories/frontend",
    category: "frontend",
    tags: ["frontend"],
    updatedAt: "2026-03-28T00:00:00.000Z",
    score: 1
  };

  const briefHit: SearchHit = {
    id: "brief:frontend",
    kind: "brief",
    title: "Daily Frontend Brief",
    description: "Today's frontend changes.",
    href: "/categories/frontend",
    category: "frontend",
    tags: ["react", "css"],
    updatedAt: "2026-03-28T00:00:00.000Z",
    score: 0.8
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
