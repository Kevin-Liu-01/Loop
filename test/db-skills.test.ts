import assert from "node:assert/strict";
import test from "node:test";

import { rowToSkillRecord } from "@/lib/db/skills";
import type { AgentDocs } from "@/lib/types";

const MOCK_ROW = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "test-skill",
  title: "Test Skill",
  description: "A skill for testing.",
  category: "frontend",
  body: "# Test\n\nThis is a test skill.",
  accent: "signal-red",
  featured: false,
  visibility: "public",
  origin: "repo",
  path: "/skills/test-skill/SKILL.md",
  relative_dir: "skills/test-skill",
  tags: ["frontend", "test"],
  headings: [{ depth: 1, title: "Test", anchor: "test" }],
  owner_name: null,
  sources: [],
  automation: null,
  updates: [],
  agent_docs: { codex: "Codex-specific docs", cursor: "Cursor-specific docs" },
  references_data: [],
  agents_data: [],
  source_url: null,
  canonical_url: null,
  sync_enabled: false,
  last_synced_at: null,
  version: 1,
  created_at: "2026-03-28T00:00:00.000Z",
  updated_at: "2026-03-28T00:00:00.000Z"
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
  assert.deepEqual(record.headings, [{ depth: 1, title: "Test", anchor: "test" }]);
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
    owner_name: null,
    source_url: null,
    canonical_url: null,
    automation: null,
    agent_docs: {}
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
    { version: 3, label: "v3", updatedAt: "2026-03-28T00:00:00.000Z" },
    { version: 2, label: "v2", updatedAt: "2026-03-27T00:00:00.000Z" },
    { version: 1, label: "v1", updatedAt: "2026-03-26T00:00:00.000Z" }
  ];

  const record = rowToSkillRecord(MOCK_ROW, versions);

  assert.equal(record.availableVersions.length, 3);
  assert.equal(record.availableVersions[0]?.version, 3);
  assert.equal(record.availableVersions[2]?.version, 1);
});
