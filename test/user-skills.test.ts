import assert from "node:assert/strict";
import test from "node:test";

import {
  buildUserSkillRecord,
  createNextUserSkillVersion,
  createUserSkillDocument,
  isUserSkillAutomationDue,
  updateUserSkillDocument,
} from "@/lib/user-skills";

test("createUserSkillDocument normalizes tags, sources, and automation defaults", () => {
  const skill = createUserSkillDocument({
    autoUpdate: true,
    automationCadence: "daily",
    automationPrompt: "",
    body: "## Purpose\n\nTrack platform shifts.\n\n## Workflow\n\n1. Read.\n2. Synthesize.\n3. Update.\n",
    category: "infra",
    description:
      "A living infra skill for agent operators who want concrete deploy notes.",
    ownerName: "Ops Team",
    sourceUrls: [
      "https://vercel.com/blog/rss.xml",
      "https://vercel.com/blog/rss.xml",
    ],
    tags: ["Infra", "deploy", "deploy"],
    title: "Infra Notes That Do Not Suck",
  });

  assert.equal(skill.slug, "infra-notes-that-do-not-suck");
  assert.deepEqual(skill.tags, ["infra", "deploy", "community"]);
  assert.equal(skill.sources.length, 1);
  assert.equal(skill.sources[0]?.kind, "blog");
  assert.equal(skill.automation.enabled, true);
  assert.match(skill.automation.prompt, /\$infra-notes-that-do-not-suck/);
});

test("manual or paused user skills are never due for automation", () => {
  const skill = createUserSkillDocument({
    autoUpdate: false,
    automationCadence: "manual",
    automationPrompt: "",
    body: "## Purpose\n\nStay current.\n\n## Workflow\n\n1. Scan sources.\n2. Update notes.\n",
    category: "containers",
    description:
      "Container updates for operators who would prefer fewer YAML jump scares.",
    sourceUrls: ["https://www.docker.com/blog/feed/"],
    tags: [],
    title: "Container Digest",
  });

  assert.equal(
    isUserSkillAutomationDue(skill, new Date("2026-03-27T12:00:00.000Z")),
    false
  );
  assert.equal(
    isUserSkillAutomationDue(
      {
        ...skill,
        automation: {
          ...skill.automation,
          cadence: "daily",
          enabled: true,
          status: "paused",
        },
      },
      new Date("2026-03-27T12:00:00.000Z")
    ),
    false
  );
});

test("weekly cadence only fires on Monday UTC", () => {
  const skill = createUserSkillDocument({
    autoUpdate: true,
    automationCadence: "weekly",
    automationPrompt: "Weekly refresh.",
    body: "## Purpose\n\nTrack weekly shifts.\n\n## Workflow\n\n1. Scan sources.\n2. Update notes.\n",
    category: "infra",
    description: "A weekly skill that should only fire on Mondays.",
    sourceUrls: ["https://vercel.com/blog/rss.xml"],
    tags: [],
    title: "Weekly Digest",
  });

  const monday = new Date("2026-03-30T12:00:00.000Z");
  const tuesday = new Date("2026-03-31T12:00:00.000Z");
  const sunday = new Date("2026-03-29T12:00:00.000Z");

  assert.equal(monday.getUTCDay(), 1, "sanity: 2026-03-30 is Monday");
  assert.equal(tuesday.getUTCDay(), 2, "sanity: 2026-03-31 is Tuesday");
  assert.equal(sunday.getUTCDay(), 0, "sanity: 2026-03-29 is Sunday");

  assert.equal(
    isUserSkillAutomationDue(skill, monday),
    true,
    "should fire on Monday"
  );
  assert.equal(
    isUserSkillAutomationDue(skill, tuesday),
    false,
    "should not fire on Tuesday"
  );
  assert.equal(
    isUserSkillAutomationDue(skill, sunday),
    false,
    "should not fire on Sunday"
  );
});

test("skills with 3+ consecutive failures are skipped", () => {
  const skill = createUserSkillDocument({
    autoUpdate: true,
    automationCadence: "daily",
    automationPrompt: "Refresh.",
    body: "## Purpose\n\nFail.\n\n## Workflow\n\n1. Fail.\n",
    category: "infra",
    description: "A skill that keeps failing.",
    sourceUrls: ["https://example.com/feed.xml"],
    tags: [],
    title: "Broken Skill",
  });

  const withFailures = {
    ...skill,
    automation: {
      ...skill.automation,
      consecutiveFailures: 3,
    },
  };

  assert.equal(
    isUserSkillAutomationDue(
      withFailures,
      new Date("2026-03-30T12:00:00.000Z")
    ),
    false,
    "should skip after 3 failures"
  );

  const with2Failures = {
    ...skill,
    automation: {
      ...skill.automation,
      consecutiveFailures: 2,
    },
  };

  assert.equal(
    isUserSkillAutomationDue(
      with2Failures,
      new Date("2026-03-30T12:00:00.000Z")
    ),
    true,
    "should still run with 2 failures"
  );
});

test("buildUserSkillRecord appends automation context into the rendered skill body", () => {
  const skill = createUserSkillDocument({
    autoUpdate: true,
    automationCadence: "weekly",
    automationPrompt: "Refresh protocol changes only.",
    body: "## Purpose\n\nWatch protocols.\n\n## Workflow\n\n1. Track updates.\n2. Capture deltas.\n3. Rewrite the skill.\n",
    category: "a2a",
    description:
      "Track agent protocol shifts and refresh the playbook when specs move.",
    sourceUrls: ["https://openai.com/news/rss.xml"],
    tags: ["agents"],
    title: "A2A Radar",
  });

  const versioned = createNextUserSkillVersion(
    skill,
    {
      automation: {
        ...skill.automation,
        lastRunAt: "2026-03-27T12:00:00.000Z",
      },
      body: skill.body,
      category: skill.category,
      description: skill.description,
      ownerName: skill.ownerName,
      sources: skill.sources,
      tags: skill.tags,
      title: skill.title,
      updates: [
        {
          bodyChanged: true,
          changedSections: ["Workflow", "Handshake"],
          editorModel: "gpt-5-mini",
          experiments: [
            "Rewrite the handshake section.",
            "Add one provider delta.",
          ],
          generatedAt: "2026-03-27T12:00:00.000Z",
          items: [],
          summary: "Two protocol announcements landed this week.",
          whatChanged:
            "The watchlist shifted toward agent execution contracts.",
        },
      ],
      visibility: skill.visibility,
    },
    "2026-03-27T12:00:00.000Z"
  );

  const record = buildUserSkillRecord(versioned);

  assert.equal(record.origin, "user");
  assert.equal(record.href, "/skills/a2a-radar/v2");
  assert.equal(record.version, 2);
  assert.equal(record.versionLabel, "v2");
  assert.deepEqual(
    record.availableVersions.map((version) => version.label),
    ["v2", "v1"]
  );
  assert.equal(record.agents[0]?.provider, "loop");
  assert.match(record.body, /## Update engine/);
  assert.match(record.body, /Mode: fetch -> analyze -> rewrite -> version/);
  assert.match(record.body, /## Latest automated refresh/);
  assert.match(record.body, /Body edits: yes/);
  assert.match(record.body, /Editor: gpt-5-mini/);
  assert.match(record.body, /Sections changed: Workflow, Handshake/);
  assert.match(record.body, /Refresh log|Recent signal log/);
});

test("createNextUserSkillVersion increments the revision and preserves history", () => {
  const skill = createUserSkillDocument({
    autoUpdate: true,
    automationCadence: "daily",
    automationPrompt: "Refresh infra deltas.",
    body: "## Purpose\n\nTrack infra deltas.\n\n## Workflow\n\n1. Scan source changes.\n2. Rewrite the notes.\n",
    category: "infra",
    description: "Track infra deltas and keep the operator notes current.",
    sourceUrls: ["https://vercel.com/blog/rss.xml"],
    tags: ["infra"],
    title: "Infra Desk",
  });

  const next = createNextUserSkillVersion(
    skill,
    {
      automation: {
        ...skill.automation,
        lastRunAt: "2026-03-28T12:00:00.000Z",
      },
      body: skill.body,
      category: skill.category,
      description: skill.description,
      ownerName: skill.ownerName,
      sources: skill.sources,
      tags: skill.tags,
      title: skill.title,
      updates: [
        {
          experiments: ["Update deploy notes.", "Add rollback path."],
          generatedAt: "2026-03-28T12:00:00.000Z",
          items: [],
          summary: "Fresh infra notes landed.",
          whatChanged:
            "Vercel shipped another useful thing instead of another dashboard garnish.",
        },
        ...skill.updates,
      ],
      visibility: skill.visibility,
    },
    "2026-03-28T12:00:00.000Z"
  );

  assert.equal(next.version, 2);
  assert.deepEqual(
    next.versions.map((version) => version.version),
    [2, 1]
  );
});

test("updateUserSkillDocument returns unchanged when setup matches current version", () => {
  const skill = createUserSkillDocument({
    autoUpdate: true,
    automationCadence: "daily",
    automationPrompt: "Track concrete frontend shifts.",
    body: "## Goal\n\nStay current.\n\n## Workflow\n\n1. Read the sources.\n2. Capture only real deltas.\n3. Rewrite the notes.\n",
    category: "frontend",
    description: "Keep the frontend notes current.",
    ownerName: "Kevin",
    sourceUrls: ["https://react.dev/rss.xml"],
    tags: ["frontend"],
    title: "Frontend Desk",
  });

  const result = updateUserSkillDocument(skill, {
    autoUpdate: true,
    automationCadence: "daily",
    automationPrompt: skill.automation.prompt,
    body: skill.body,
    category: skill.category,
    description: skill.description,
    ownerName: skill.ownerName,
    slug: skill.slug,
    sourceUrls: skill.sources.map((source) => source.url),
    tags: [],
    title: skill.title,
  });

  assert.equal(result.changed, false);
  assert.equal(result.skill.version, 1);
});

test("updateUserSkillDocument saves a new version with edited sources and automation", () => {
  const skill = createUserSkillDocument({
    autoUpdate: true,
    automationCadence: "daily",
    automationPrompt: "Track protocol deltas.",
    body: "## Goal\n\nWatch protocol shifts.\n\n## Workflow\n\n1. Fetch source updates.\n2. Compare protocol changes.\n3. Rewrite the skill.\n",
    category: "a2a",
    description: "Track agent protocol changes.",
    sourceUrls: ["https://openai.com/news/rss.xml"],
    tags: ["tracked", "agents"],
    title: "Protocol Watch",
  });

  const result = updateUserSkillDocument(
    skill,
    {
      autoUpdate: false,
      automationCadence: "manual",
      automationPrompt:
        "Only update the skill when the protocol actually changed.",
      body: "## Goal\n\nWatch protocol shifts.\n\n## Workflow\n\n1. Fetch.\n2. Rewrite.\n",
      category: "a2a",
      description: "Track protocol shifts and update the notes.",
      slug: skill.slug,
      sourceUrls: [
        "https://openai.com/news/rss.xml",
        "https://modelcontextprotocol.io/",
      ],
      tags: ["agents"],
      title: "Protocol Watch",
    },
    new Date("2026-03-28T12:00:00.000Z")
  );

  assert.equal(result.changed, true);
  assert.equal(result.skill.version, 2);
  assert.equal(
    result.skill.description,
    "Track protocol shifts and update the notes."
  );
  assert.equal(result.skill.sources.length, 2);
  assert.equal(result.skill.automation.enabled, false);
  assert.equal(result.skill.automation.status, "paused");
  assert.ok(result.skill.tags.includes("tracked"));
  assert.deepEqual(
    result.skill.versions.map((version) => version.version),
    [2, 1]
  );
});
