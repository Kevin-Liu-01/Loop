import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { parseAgentDocs, hasAgentDocs, getAgentDocKeys, getAgentDocLabel } from "@/lib/agent-docs";
import type { AgentDocs } from "@/lib/types";

test("parseAgentDocs reads sibling markdown files", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-docs-test-"));

  try {
    await fs.writeFile(path.join(tmpDir, "codex.md"), "# Codex Rules\n\nUse these rules.");
    await fs.writeFile(path.join(tmpDir, "cursor.md"), "# Cursor Rules\n\nFollow cursor patterns.");
    await fs.writeFile(path.join(tmpDir, "AGENTS.md"), "# Agents\n\nAgent config.");

    const docs = await parseAgentDocs(tmpDir);

    assert.equal(docs.codex, "# Codex Rules\n\nUse these rules.");
    assert.equal(docs.cursor, "# Cursor Rules\n\nFollow cursor patterns.");
    assert.equal(docs.agents, "# Agents\n\nAgent config.");
    assert.equal(docs.claude, undefined);
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

test("parseAgentDocs returns empty object when no files exist", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-docs-empty-"));

  try {
    const docs = await parseAgentDocs(tmpDir);
    assert.deepEqual(docs, {});
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

test("parseAgentDocs trims whitespace from content", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-docs-trim-"));

  try {
    await fs.writeFile(path.join(tmpDir, "claude.md"), "\n\n  Hello Claude  \n\n");

    const docs = await parseAgentDocs(tmpDir);

    assert.equal(docs.claude, "Hello Claude");
  } finally {
    await fs.rm(tmpDir, { recursive: true });
  }
});

test("hasAgentDocs returns true when docs have content", () => {
  assert.equal(hasAgentDocs({ codex: "Some content" }), true);
  assert.equal(hasAgentDocs({ codex: "Some content", cursor: "More content" }), true);
});

test("hasAgentDocs returns false for empty or undefined docs", () => {
  assert.equal(hasAgentDocs(undefined), false);
  assert.equal(hasAgentDocs({}), false);
  assert.equal(hasAgentDocs({ codex: "" }), false);
});

test("getAgentDocKeys returns only keys with non-empty content", () => {
  const docs: AgentDocs = {
    codex: "Content",
    cursor: "",
    claude: "Also content",
    agents: undefined
  };

  const keys = getAgentDocKeys(docs);

  assert.deepEqual(keys.sort(), ["claude", "codex"]);
});

test("getAgentDocKeys returns empty array for undefined docs", () => {
  assert.deepEqual(getAgentDocKeys(undefined), []);
});

test("getAgentDocLabel returns human-readable labels", () => {
  assert.equal(getAgentDocLabel("codex"), "Codex");
  assert.equal(getAgentDocLabel("cursor"), "Cursor");
  assert.equal(getAgentDocLabel("claude"), "Claude");
  assert.equal(getAgentDocLabel("agents"), "AGENTS.md");
});
