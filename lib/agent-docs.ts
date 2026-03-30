import fs from "node:fs/promises";
import path from "node:path";

import type { AgentDocKey, AgentDocs } from "@/lib/types";
import { AGENT_DOC_FILENAMES } from "@/lib/types";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function parseAgentDocs(skillDir: string): Promise<AgentDocs> {
  const docs: AgentDocs = {};

  const entries = Object.entries(AGENT_DOC_FILENAMES) as [AgentDocKey, string][];

  const results = await Promise.all(
    entries.map(async ([key, filename]) => {
      const filePath = path.join(skillDir, filename);
      if (!(await fileExists(filePath))) return null;

      const content = await fs.readFile(filePath, "utf8");
      return { key, content: content.trim() };
    })
  );

  for (const result of results) {
    if (result) {
      docs[result.key] = result.content;
    }
  }

  return docs;
}

export function hasAgentDocs(docs: AgentDocs | undefined): boolean {
  if (!docs) return false;
  return Object.values(docs).some((value) => typeof value === "string" && value.length > 0);
}

export function getAgentDocKeys(docs: AgentDocs | undefined): AgentDocKey[] {
  if (!docs) return [];
  return (Object.keys(docs) as AgentDocKey[]).filter(
    (key) => typeof docs[key] === "string" && (docs[key] as string).length > 0
  );
}

export function getAgentDocLabel(key: AgentDocKey): string {
  switch (key) {
    case "codex":
      return "Codex";
    case "cursor":
      return "Cursor";
    case "claude":
      return "Claude";
    case "agents":
      return "AGENTS.md";
    default:
      return key;
  }
}
