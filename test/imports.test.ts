import assert from "node:assert/strict";
import test from "node:test";

import { buildAgentContext } from "@/lib/agents";
import {
  buildImportedSkillDraft,
  buildImportedSkillRecord,
  extractMcpDocuments,
} from "@/lib/imports";
import type { LoopSnapshot } from "@/lib/types";

test("buildImportedSkillDraft normalizes markdown imports into remote skills", () => {
  const skill = buildImportedSkillDraft(
    "# MCP Notes\n\nTrack agent tooling.\n\n## Workflow\n\n1. Read.\n2. Synthesize.\n",
    "https://raw.githubusercontent.com/acme/skill-pack/main/SKILL.md",
    new Date("2026-03-27T12:00:00.000Z")
  );

  assert.equal(skill.slug.startsWith("mcp-notes-"), true);
  assert.equal(skill.visibility, "public");
  assert.equal(skill.syncEnabled, true);
  assert.equal(skill.ownerName, "acme");
  assert.equal(skill.version, 1);
  assert.deepEqual(
    skill.versions.map((version) => version.version),
    [1]
  );
});

test("extractMcpDocuments parses common mcpServers JSON", () => {
  const documents = extractMcpDocuments(
    JSON.stringify({
      mcpServers: {
        linear: {
          description: "Linear tools",
          url: "https://mcp.linear.app/mcp",
        },
        playwright: {
          args: ["-y", "@playwright/mcp@latest"],
          command: "npx",
        },
      },
    }),
    "https://example.com/mcp.json"
  );

  assert.equal(documents.length, 2);
  assert.equal(documents[0]?.manifestUrl, "https://example.com/mcp.json");
  assert.ok(documents.some((entry) => entry.transport === "http"));
  assert.ok(documents.some((entry) => entry.transport === "stdio"));
});

test("buildAgentContext includes selected skills and mcps", () => {
  const snapshot = {
    automations: [],
    categories: [],
    dailyBriefs: [],
    generatedAt: "2026-03-27T12:00:00.000Z",
    generatedFrom: "local-scan",
    mcps: [
      {
        args: [],
        createdAt: "2026-03-27T12:00:00.000Z",
        description: "Issue tracking MCP.",
        envKeys: [],
        id: "linear",
        manifestUrl: "https://example.com/mcp.json",
        name: "Linear",
        raw: "{}",
        tags: ["linear"],
        transport: "http",
        updatedAt: "2026-03-27T12:00:00.000Z",
        url: "https://mcp.linear.app/mcp",
        version: 1,
        versionLabel: "v1",
        versions: [
          {
            args: [],
            description: "Issue tracking MCP.",
            envKeys: [],
            manifestUrl: "https://example.com/mcp.json",
            raw: "{}",
            tags: ["linear"],
            transport: "http",
            updatedAt: "2026-03-27T12:00:00.000Z",
            url: "https://mcp.linear.app/mcp",
            version: 1,
          },
        ],
      },
    ],
    plans: [],
    skills: [
      {
        accent: "signal-red",
        agents: [
          {
            defaultPrompt: "Use $frontend-frontier",
            displayName: "Default",
            path: "/tmp/default",
            provider: "loop",
            shortDescription: "default",
          },
        ],
        automations: [],
        availableVersions: [
          {
            label: "v1",
            updatedAt: "2026-03-27T12:00:00.000Z",
            version: 1,
          },
        ],
        body: "Do sharp frontend work.",
        category: "frontend",
        description: "Design engineering skill.",
        excerpt: "Do sharp frontend work.",
        featured: true,
        headings: [],
        href: "/skills/frontend-frontier/v1",
        origin: "repo",
        path: "/tmp/frontend",
        references: [],
        relativeDir: "tmp/frontend",
        slug: "frontend-frontier",
        tags: ["frontend"],
        title: "Frontend Frontier",
        updatedAt: "2026-03-27T12:00:00.000Z",
        version: 1,
        versionLabel: "v1",
        visibility: "public",
      },
    ],
  } satisfies LoopSnapshot;

  const context = buildAgentContext(snapshot, {
    model: "openai/gpt-5.4-mini",
    providerId: "gateway",
    selectedMcpIds: ["linear"],
    selectedSkillSlugs: ["frontend-frontier"],
    systemPrompt: "Use attached context first.",
  });

  assert.match(context, /Frontend Frontier/);
  assert.match(context, /Version\*\*: v1/);
  assert.match(context, /Linear \(v1\)/);
  assert.match(context, /Use attached context first/);
});

test("buildImportedSkillRecord exposes a versioned href", () => {
  const draft = buildImportedSkillDraft(
    "# Containers Radar\n\nTrack container platform shifts.\n",
    "https://example.com/containers.md",
    new Date("2026-03-27T12:00:00.000Z")
  );

  const record = buildImportedSkillRecord(draft);

  assert.equal(record.href, `/skills/${draft.slug}/v1`);
  assert.equal(record.path, "https://example.com/containers.md");
  assert.equal(record.versionLabel, "v1");
});
