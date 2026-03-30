export type SkillLineKind = "added" | "removed" | "context";

export type SkillLine = {
  text: string;
  kind: SkillLineKind;
};

/**
 * TOML skill diff lines that tile across the hero viewport.
 * Combined from all diff frames into one continuous block.
 */
export const HERO_SKILL_LINES: SkillLine[] = [
  { text: "[model]", kind: "context" },
  { text: 'name = "reasoning-agent"', kind: "context" },
  { text: 'engine = "gpt-4"', kind: "removed" },
  { text: 'engine = "gpt-4-turbo-2025-01"', kind: "added" },
  { text: "temperature = 0.7", kind: "removed" },
  { text: "temperature = 0.3", kind: "added" },
  { text: "", kind: "context" },
  { text: "[behavior]", kind: "context" },
  { text: 'strategy = "chain-of-thought"', kind: "added" },
  { text: "cite_sources = true", kind: "added" },
  { text: "", kind: "context" },
  { text: "[tools]", kind: "context" },
  { text: "web_search = true", kind: "context" },
  { text: "code_interpreter = true", kind: "context" },
  { text: "file_analysis = true", kind: "added" },
  { text: "knowledge_retrieval = true", kind: "added" },
  { text: "", kind: "context" },
  { text: "[guardrails]", kind: "context" },
  { text: "max_tokens = 4096", kind: "added" },
  { text: 'rate_limit = "60/min"', kind: "added" },
  { text: "allow_unsafe = true", kind: "removed" },
  { text: 'sandbox = "strict"', kind: "added" },
  { text: "", kind: "context" },
  { text: "[evaluation]", kind: "context" },
  { text: 'benchmark = "mmlu-pro"', kind: "added" },
  { text: "threshold = 0.92", kind: "added" },
  { text: "auto_rollback = true", kind: "context" },
  { text: "", kind: "context" },
  { text: "[loop]", kind: "context" },
  { text: 'interval = "24h"', kind: "removed" },
  { text: 'interval = "6h"', kind: "added" },
  { text: 'trigger = "source_change"', kind: "added" },
  { text: 'notify = ["slack", "email"]', kind: "context" },
  { text: 'diff_review = "auto"', kind: "added" },
  { text: "", kind: "context" },
  { text: "[mcp]", kind: "context" },
  { text: 'servers = ["github", "filesystem", "brave-search"]', kind: "added" },
  { text: 'transport = "stdio"', kind: "added" },
  { text: "auto_discover = true", kind: "added" },
];
