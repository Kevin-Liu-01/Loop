import assert from "node:assert/strict";
import test from "node:test";

import { rowToSkillRecord } from "@/lib/db/skills";
import type { AgentDocs } from "@/lib/types";

const MOCK_ROW = {
  accent: "signal-red",
  agent_docs: { codex: "Codex-specific docs", cursor: "Cursor-specific docs" },
  agents_data: [],
  automation: null,
  body: "# Test\n\nThis is a test skill.",
  canonical_url: null,
  category: "frontend",
  created_at: "2026-03-28T00:00:00.000Z",
  description: "A skill for testing.",
  featured: false,
  headings: [{ anchor: "test", depth: 1, title: "Test" }],
  id: "00000000-0000-0000-0000-000000000001",
  last_synced_at: null,
  origin: "repo",
  owner_name: null,
  path: "/skills/test-skill/SKILL.md",
  references_data: [],
  relative_dir: "skills/test-skill",
  slug: "test-skill",
  source_url: null,
  sources: [],
  sync_enabled: false,
  tags: ["frontend", "test"],
  title: "Test Skill",
  updated_at: "2026-03-28T00:00:00.000Z",
  updates: [],
  version: 1,
  visibility: "public",
};

test("rowToSkillRecord maps snake_case to camelCase correctly", () => {
  const record = rowToSkillRecord(MOCK_ROW);

  assert.equal(record.slug, "test-skill");
  assert.equal(record.title, "Test Skill");
  assert.equal(record.description, "A skill for testing.");
  assert.equal(record.category, "frontend");
  assert.equal(record.origin, "repo");
  assert.equal(record.visibility, "public");
  assert.equal(record.featured, false);
  assert.equal(record.version, 1);
  assert.equal(record.versionLabel, "v1");
  assert.equal(record.path, "/skills/test-skill/SKILL.md");
  assert.equal(record.relativeDir, "skills/test-skill");
  assert.equal(record.updatedAt, "2026-03-28T00:00:00.000Z");
  assert.deepEqual(record.tags, ["frontend", "test"]);
  assert.deepEqual(record.headings, [
    { anchor: "test", depth: 1, title: "Test" },
  ]);
  assert.equal(record.href, "/skills/test-skill/v1");
});

test("rowToSkillRecord maps agentDocs from agent_docs JSONB", () => {
  const record = rowToSkillRecord(MOCK_ROW);
  const docs = record.agentDocs as AgentDocs;

  assert.equal(docs.codex, "Codex-specific docs");
  assert.equal(docs.cursor, "Cursor-specific docs");
  assert.equal(docs.claude, undefined);
  assert.equal(docs.agents, undefined);
});

test("rowToSkillRecord handles null optional fields gracefully", () => {
  const rowWithNulls = {
    ...MOCK_ROW,
    agent_docs: {},
    automation: null,
    canonical_url: null,
    owner_name: null,
    source_url: null,
  };

  const record = rowToSkillRecord(rowWithNulls);

  assert.equal(record.ownerName, undefined);
  assert.equal(record.automation, undefined);
  assert.deepEqual(record.agentDocs, {});
});

test("rowToSkillRecord generates excerpt from body", () => {
  const record = rowToSkillRecord(MOCK_ROW);

  assert.ok(record.excerpt.length > 0);
  assert.ok(record.excerpt.length <= 220 + 1);
});

test("rowToSkillRecord includes default version in availableVersions", () => {
  const record = rowToSkillRecord(MOCK_ROW);

  assert.equal(record.availableVersions.length, 1);
  assert.equal(record.availableVersions[0]?.version, 1);
  assert.equal(record.availableVersions[0]?.label, "v1");
});

test("rowToSkillRecord respects custom availableVersions", () => {
  const versions = [
    { label: "v3", updatedAt: "2026-03-28T00:00:00.000Z", version: 3 },
    { label: "v2", updatedAt: "2026-03-27T00:00:00.000Z", version: 2 },
    { label: "v1", updatedAt: "2026-03-26T00:00:00.000Z", version: 1 },
  ];

  const record = rowToSkillRecord(MOCK_ROW, versions);

  assert.equal(record.availableVersions.length, 3);
  assert.equal(record.availableVersions[0]?.version, 3);
  assert.equal(record.availableVersions[2]?.version, 1);
});
