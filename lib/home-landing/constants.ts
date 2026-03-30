export const LANDING_PALETTE = {
  bg: "#08080a",
  surface: "rgba(17, 17, 17, 0.92)",
  surfaceBorder: "#1e1e1e",
  surfaceHeader: "rgba(24, 24, 24, 0.65)",

  text: "#d4d4d4",
  textMuted: "#737373",
  textFaint: "#404040",

  added: "#e8650a",
  addedBg: "rgba(232, 101, 10, 0.08)",
  removed: "#6b6b6b",
  removedBg: "rgba(100, 100, 100, 0.06)",

  cursor: "#ff7a1a",
  lineNum: "#2e2e2e",
  accent: "#e8650a",
} as const;

export const FONT_MONO =
  '"IBM Plex Mono", "SFMono-Regular", "SF Mono", monospace';
export const FONT_SIZE = 13;
export const LINE_HEIGHT = 22;
export const FONT_CSS = `${FONT_SIZE}px ${FONT_MONO}`;
export const FONT_CSS_BOLD = `600 ${FONT_SIZE}px ${FONT_MONO}`;
export const FONT_CSS_HEADER = `500 ${FONT_SIZE - 1}px ${FONT_MONO}`;

export const PANEL = {
  width: 640,
  paddingX: 20,
  paddingY: 16,
  headerHeight: 38,
  lineNumWidth: 36,
  markerWidth: 16,
  radius: 16,
  gap: 4,
} as const;

export const TIMING = {
  charMs: 30,
  linePauseMs: 80,
  frameHoldMs: 2400,
  fadeOutMs: 500,
  fadeInMs: 300,
  contextAppearMs: 50,
} as const;

export type DiffLineKind =
  | "context"
  | "added"
  | "removed"
  | "header"
  | "blank";

export type DiffLine = {
  kind: DiffLineKind;
  text: string;
};

export type DiffFrame = {
  filename: string;
  lines: DiffLine[];
};

export const DIFF_FRAMES: DiffFrame[] = [
  {
    filename: "skills/reasoning-agent/v2.toml",
    lines: [
      { kind: "header", text: "[model]" },
      { kind: "context", text: 'name = "reasoning-agent"' },
      { kind: "removed", text: 'engine = "gpt-4"' },
      { kind: "added", text: 'engine = "gpt-4-turbo-2025-01"' },
      { kind: "removed", text: "temperature = 0.7" },
      { kind: "added", text: "temperature = 0.3" },
      { kind: "blank", text: "" },
      { kind: "header", text: "[behavior]" },
      { kind: "context", text: "Follow user instructions." },
      { kind: "added", text: 'strategy = "chain-of-thought"' },
      { kind: "added", text: "cite_sources = true" },
    ],
  },
  {
    filename: "skills/reasoning-agent/v3.toml",
    lines: [
      { kind: "header", text: "[tools]" },
      { kind: "context", text: "web_search = true" },
      { kind: "context", text: "code_interpreter = true" },
      { kind: "added", text: "file_analysis = true" },
      { kind: "added", text: "knowledge_retrieval = true" },
      { kind: "blank", text: "" },
      { kind: "header", text: "[guardrails]" },
      { kind: "added", text: "max_tokens = 4096" },
      { kind: "added", text: 'rate_limit = "60/min"' },
      { kind: "removed", text: "allow_unsafe = true" },
      { kind: "added", text: 'sandbox = "strict"' },
    ],
  },
  {
    filename: "skills/reasoning-agent/v4.toml",
    lines: [
      { kind: "header", text: "[evaluation]" },
      { kind: "added", text: 'benchmark = "mmlu-pro"' },
      { kind: "added", text: "threshold = 0.92" },
      { kind: "context", text: "auto_rollback = true" },
      { kind: "blank", text: "" },
      { kind: "header", text: "[loop]" },
      { kind: "removed", text: 'interval = "24h"' },
      { kind: "added", text: 'interval = "6h"' },
      { kind: "added", text: 'trigger = "source_change"' },
      { kind: "context", text: 'notify = ["slack", "email"]' },
      { kind: "added", text: 'diff_review = "auto"' },
    ],
  },
];
