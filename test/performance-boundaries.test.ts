import assert from "node:assert/strict";
import test from "node:test";

import { skillCacheTag } from "@/lib/cache-tags";
import { toHomeMcpDocument, toHomeSkillRecord } from "@/lib/home-catalogue";
import {
  buildRefreshExecutionPlan,
  parseRefreshScope,
} from "@/lib/refresh-scope";
import { hasValidBearerToken } from "@/lib/request-auth";
import type { ImportedMcpDocument, SkillRecord } from "@/lib/types";

const skillFixture: SkillRecord = {
  accent: "orange",
  agentDocs: { claude: "large agent instructions" },
  agents: [
    {
      defaultPrompt: "large prompt",
      displayName: "Agent",
      path: "/agent",
      provider: "test",
      shortDescription: "Test agent",
    },
  ],
  automations: [],
  availableVersions: [
    { label: "v2", updatedAt: "2026-07-23T00:00:00.000Z", version: 2 },
    { label: "v1", updatedAt: "2026-07-22T00:00:00.000Z", version: 1 },
  ],
  body: "# Large markdown body",
  category: "frontend",
  description: "A compact catalogue description.",
  excerpt: "Large markdown body",
  featured: true,
  headings: [{ anchor: "large", depth: 1, title: "Large" }],
  href: "/skills/test-skill/v2",
  origin: "user",
  path: "/skills/test-skill",
  references: [
    { excerpt: "reference", path: "/ref", slug: "ref", title: "Ref" },
  ],
  relativeDir: "skills/test-skill",
  researchProfile: { process: [], summary: "large research payload" },
  slug: "test-skill",
  tags: ["frontend"],
  title: "Test Skill",
  updatedAt: "2026-07-23T00:00:00.000Z",
  updates: [],
  version: 2,
  versionLabel: "v2",
  visibility: "public",
};

const mcpFixture: ImportedMcpDocument = {
  args: ["--large"],
  createdAt: "2026-07-23T00:00:00.000Z",
  description: "Test MCP",
  envKeys: ["TOKEN"],
  headers: { Authorization: "secret" },
  id: "test-mcp",
  manifestUrl: "https://example.com/mcp.json",
  name: "Test MCP",
  normalizedConfig: { large: true },
  raw: "large raw manifest",
  tags: ["developer-tools"],
  transport: "stdio",
  updatedAt: "2026-07-23T00:00:00.000Z",
  version: 2,
  versionLabel: "v2",
  versions: [
    {
      args: ["--large"],
      description: "Historical MCP",
      envKeys: [],
      manifestUrl: "https://example.com/mcp.json",
      raw: "large historical manifest",
      tags: [],
      transport: "stdio",
      updatedAt: "2026-07-22T00:00:00.000Z",
      version: 1,
    },
  ],
};

test("refresh scopes map to explicit bounded execution plans", () => {
  assert.equal(parseRefreshScope("https://loop.test/api/refresh"), "all");
  assert.equal(
    parseRefreshScope("https://loop.test/api/refresh?scope=skills-only"),
    "skills-only"
  );
  assert.equal(
    parseRefreshScope("https://loop.test/api/refresh?scope=everything"),
    null
  );
  assert.deepEqual(buildRefreshExecutionPlan("signals-only"), {
    refreshCategorySignals: true,
    refreshImportedSkills: false,
    refreshUserSkills: false,
  });
  assert.deepEqual(buildRefreshExecutionPlan("daily"), {
    refreshCategorySignals: true,
    refreshImportedSkills: false,
    refreshUserSkills: true,
  });
});

test("bearer validation rejects missing, malformed, and mismatched secrets", () => {
  assert.equal(hasValidBearerToken(null, "secret"), false);
  assert.equal(hasValidBearerToken("Basic secret", "secret"), false);
  assert.equal(hasValidBearerToken("Bearer wrong", "secret"), false);
  assert.equal(hasValidBearerToken("Bearer secret", "secret"), true);
});

test("home skill projection removes detail payload while preserving card data", () => {
  const projected = toHomeSkillRecord(skillFixture);
  assert.equal(projected.body, "");
  assert.equal(projected.agentDocs, undefined);
  assert.deepEqual(projected.references, []);
  assert.deepEqual(projected.availableVersions, [
    { label: "v2", updatedAt: skillFixture.updatedAt, version: 2 },
  ]);
  assert.equal(projected.title, skillFixture.title);
  assert.equal(skillFixture.body, "# Large markdown body");
});

test("home MCP projection removes raw and historical configuration", () => {
  const projected = toHomeMcpDocument(mcpFixture);
  assert.equal(projected.raw, "");
  assert.deepEqual(projected.versions, []);
  assert.equal(projected.headers, undefined);
  assert.equal(projected.name, mcpFixture.name);
});

test("skill cache tags are isolated by slug", () => {
  assert.equal(skillCacheTag("frontend-frontier"), "skill:frontend-frontier");
  assert.notEqual(skillCacheTag("a"), skillCacheTag("b"));
});
