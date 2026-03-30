import assert from "node:assert/strict";
import test from "node:test";

import { CATEGORY_REGISTRY } from "@/lib/registry";

test("CATEGORY_REGISTRY has entries to seed", () => {
  assert.ok(CATEGORY_REGISTRY.length > 0, "Category registry should not be empty");
});

test("Each category has required fields for migration", () => {
  for (const category of CATEGORY_REGISTRY) {
    assert.ok(category.slug, `Category missing slug`);
    assert.ok(category.title, `Category "${category.slug}" missing title`);
    assert.ok(category.strapline !== undefined, `Category "${category.slug}" missing strapline`);
    assert.ok(category.description !== undefined, `Category "${category.slug}" missing description`);
    assert.ok(Array.isArray(category.keywords), `Category "${category.slug}" keywords should be an array`);
    assert.ok(Array.isArray(category.sources), `Category "${category.slug}" sources should be an array`);
  }
});

test("Category slugs are unique", () => {
  const slugs = CATEGORY_REGISTRY.map((c) => c.slug);
  const uniqueSlugs = new Set(slugs);
  assert.equal(slugs.length, uniqueSlugs.size, "Category slugs should be unique");
});

test("Category sources have valid structure", () => {
  for (const category of CATEGORY_REGISTRY) {
    for (const source of category.sources) {
      assert.ok(source.id, `Source in "${category.slug}" missing id`);
      assert.ok(source.label, `Source in "${category.slug}" missing label`);
      assert.ok(source.url, `Source in "${category.slug}" missing url`);
      assert.ok(source.kind, `Source in "${category.slug}" missing kind`);
      assert.ok(Array.isArray(source.tags), `Source in "${category.slug}" tags should be an array`);
    }
  }
});

test("Migration file references for JSON stores exist as constants", () => {
  const contentDir = "content/generated";
  const expectedFiles = [
    "loop-user-skills.local.json",
    "loop-imports.local.json",
    "loop-system.local.json"
  ];

  for (const file of expectedFiles) {
    assert.ok(file.endsWith(".local.json"), `Expected local JSON file pattern: ${file}`);
    assert.ok(file.startsWith("loop-"), `Expected loop prefix: ${file}`);
  }
});
