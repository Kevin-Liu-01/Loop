import assert from "node:assert/strict";
import test from "node:test";

import { buildSearchIndex, searchIndex } from "@/lib/search";
import type { LoopSnapshot, SearchHit } from "@/lib/types";

test("searchIndex ranks matching skills and categories from the persisted corpus", () => {
  const snapshot = {
    automations: [],
    categories: [
      {
        accent: "signal-red",
        description: "Frontend category",
        hero: "Frontend hero",
        keywords: ["frontend", "react"],
        slug: "frontend",
        sources: [],
        status: "live",
        strapline: "UI systems",
        title: "Frontend",
      },
    ],
    dailyBriefs: [
      {
        experiments: ["Ship it"],
        generatedAt: "2026-03-27T12:00:00.000Z",
        items: [],
        slug: "frontend",
        summary: "Frontend changed.",
        title: "Frontend brief",
        whatChanged: "React shipped a thing.",
      },
    ],
    generatedAt: "2026-03-27T12:00:00.000Z",
    generatedFrom: "local-scan",
    mcps: [],
    plans: [],
    skills: [
      {
        accent: "signal-red",
        agents: [],
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
        description: "Sharp frontend systems and motion.",
        excerpt: "Do sharp frontend work.",
        featured: true,
        headings: [],
        href: "/skills/frontend-frontier/v1",
        origin: "repo",
        path: "/tmp/frontend",
        references: [],
        relativeDir: "tmp/frontend",
        slug: "frontend-frontier",
        tags: ["frontend", "motion"],
        title: "Frontend Frontier",
        updatedAt: "2026-03-27T12:00:00.000Z",
        version: 1,
        versionLabel: "v1",
        visibility: "public",
      },
    ],
  } satisfies LoopSnapshot;

  const index = buildSearchIndex(snapshot);
  const hits = searchIndex(index, "frontend");

  assert.equal(hits[0]?.kind, "skill");
  assert.equal(hits[0]?.title, "Frontend Frontier");
  assert.ok(hits.some((hit: SearchHit) => hit.kind === "category"));
});

test("searchIndex can return only skills for blank queries", () => {
  const snapshot = {
    automations: [],
    categories: [
      {
        accent: "signal-red",
        description: "Frontend category",
        hero: "Frontend hero",
        keywords: ["frontend", "react"],
        slug: "frontend",
        sources: [],
        status: "live",
        strapline: "UI systems",
        title: "Frontend",
      },
    ],
    dailyBriefs: [
      {
        experiments: ["Ship it"],
        generatedAt: "2026-03-27T12:00:00.000Z",
        items: [],
        slug: "frontend",
        summary: "Frontend changed.",
        title: "Frontend brief",
        whatChanged: "React shipped a thing.",
      },
    ],
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
        agents: [],
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
        description: "Sharp frontend systems and motion.",
        excerpt: "Do sharp frontend work.",
        featured: true,
        headings: [],
        href: "/skills/frontend-frontier/v1",
        origin: "repo",
        path: "/tmp/frontend",
        references: [],
        relativeDir: "tmp/frontend",
        slug: "frontend-frontier",
        tags: ["frontend", "motion"],
        title: "Frontend Frontier",
        updatedAt: "2026-03-27T12:00:00.000Z",
        version: 1,
        versionLabel: "v1",
        visibility: "public",
      },
    ],
  } satisfies LoopSnapshot;

  const index = buildSearchIndex(snapshot);
  const hits = searchIndex(index, "", { kind: "skill", limit: 50 });

  assert.deepEqual(
    hits.map((hit: SearchHit) => hit.kind),
    ["skill"]
  );
  assert.equal(hits[0]?.title, "Frontend Frontier");
});
