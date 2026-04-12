import assert from "node:assert/strict";
import test from "node:test";

import { buildLoopRunResult, buildLoopUpdateTarget } from "@/lib/loop-updates";
import { diffMultilineText } from "@/lib/text-diff";
import type { SkillRecord } from "@/lib/types";
import { buildUpdateDigest } from "@/lib/update-digest";

test("diffMultilineText marks removed and added lines", () => {
  const diff = diffMultilineText(
    "alpha\nbeta\ngamma",
    "alpha\nbeta updated\ngamma\ndelta"
  );

  assert.deepEqual(
    diff.map((line) => [line.type, line.value]),
    [
      ["context", "alpha"],
      ["removed", "beta"],
      ["added", "beta updated"],
      ["context", "gamma"],
      ["added", "delta"],
    ]
  );
});

test("buildLoopUpdateTarget normalizes an updateable user loop", () => {
  const target = buildLoopUpdateTarget({
    accent: "signal-blue",
    agents: [],
    automation: {
      cadence: "daily",
      enabled: true,
      prompt: "Refresh.",
      status: "active",
    },
    automations: [],
    availableVersions: [
      {
        label: "v3",
        updatedAt: "2026-03-27T12:00:00.000Z",
        version: 3,
      },
    ],
    body: "## Purpose",
    category: "frontend",
    description: "Keep frontend notes current.",
    excerpt: "Keep frontend notes current.",
    featured: false,
    headings: [],
    href: "/skills/frontend-loop/v3",
    origin: "user",
    path: "loop://community-skills/frontend-loop",
    references: [],
    relativeDir: "community/frontend-loop",
    slug: "frontend-loop",
    sources: [
      {
        id: "src-1",
        kind: "rss",
        label: "React Blog",
        tags: ["frontend"],
        url: "https://react.dev/rss.xml",
      },
    ],
    tags: ["frontend"],
    title: "Frontend Loop",
    updatedAt: "2026-03-27T12:00:00.000Z",
    updates: [
      {
        bodyChanged: true,
        changedSections: ["Workflow", "Sources"],
        editorModel: "gpt-5-mini",
        experiments: [],
        generatedAt: "2026-03-27T12:00:00.000Z",
        items: [],
        summary: "A fresh frontend delta landed.",
        whatChanged: "Routing notes changed.",
      },
    ],
    version: 3,
    versionLabel: "v3",
    visibility: "public",
  } satisfies SkillRecord);

  assert.equal(target.origin, "user");
  assert.equal(target.automationLabel, "daily active");
  assert.equal(
    target.sources[0]?.logoUrl.includes("google.com/s2/favicons"),
    true
  );
  assert.equal(target.lastSummary, "A fresh frontend delta landed.");
  assert.equal(target.lastWhatChanged, "Routing notes changed.");
  assert.equal(target.lastExperiments?.length, 0);
  assert.deepEqual(target.lastChangedSections, ["Workflow", "Sources"]);
  assert.equal(target.lastBodyChanged, true);
  assert.equal(target.lastEditorModel, "gpt-5-mini");
});

test("buildUpdateDigest turns an update entry into a readable diff target", () => {
  const digest = buildUpdateDigest({
    bodyChanged: true,
    changedSections: ["Workflow"],
    editorModel: "gpt-5-mini",
    experiments: ["Rewrite the prompt.", "Trim the stale checklist."],
    generatedAt: "2026-03-27T12:00:00.000Z",
    items: [
      {
        publishedAt: "2026-03-27T11:00:00.000Z",
        source: "React Router",
        summary: "Router update.",
        tags: ["frontend"],
        title: "React Router notes",
        url: "https://reactrouter.com",
      },
    ],
    summary: "A new source landed.",
    whatChanged: "The guidance shifted toward clearer routing notes.",
  });

  assert.match(digest, /Summary: A new source landed\./);
  assert.match(
    digest,
    /What changed: The guidance shifted toward clearer routing notes\./
  );
  assert.match(digest, /Body changed: yes/);
  assert.match(digest, /Editor: gpt-5-mini/);
  assert.match(digest, /Changed sections: Workflow/);
  assert.match(digest, /Experiments:/);
  assert.match(digest, /Signals:/);
});

test("buildLoopRunResult turns a stored run back into a visible revision result", () => {
  const result = buildLoopRunResult({
    bodyChanged: true,
    changedSections: ["Workflow"],
    diffLines: [
      {
        rightNumber: 10,
        type: "added",
        value: "New workflow line",
      },
    ],
    editorModel: "gpt-5-mini",
    finishedAt: "2026-03-27T12:05:00.000Z",
    href: "/skills/frontend-loop/v3",
    id: "run-1",
    messages: [],
    nextVersionLabel: "v3",
    origin: "user",
    previousVersionLabel: "v2",
    signalCount: 2,
    slug: "frontend-loop",
    sourceCount: 1,
    sources: [
      {
        id: "source-1",
        itemCount: 1,
        items: [
          {
            publishedAt: "2026-03-27T11:00:00.000Z",
            source: "React",
            summary: "Compiler notes.",
            tags: ["frontend"],
            title: "React compiler",
            url: "https://react.dev/blog/compiler",
          },
        ],
        kind: "rss",
        label: "React",
        logoUrl: "https://example.com/logo.png",
        status: "done",
        url: "https://react.dev/rss.xml",
      },
    ],
    startedAt: "2026-03-27T12:00:00.000Z",
    status: "success",
    summary: "A new body revision landed.",
    title: "Frontend Loop",
    trigger: "automation",
    whatChanged: "The workflow section was rewritten.",
  });

  assert.equal(result?.changed, true);
  assert.equal(result?.bodyChanged, true);
  assert.equal(result?.editorModel, "gpt-5-mini");
  assert.deepEqual(result?.changedSections, ["Workflow"]);
  assert.equal(result?.items?.[0]?.title, "React compiler");
});
