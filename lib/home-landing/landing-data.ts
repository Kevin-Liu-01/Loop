/**
 * Static demo data for the landing page — real skill shapes, real diff lines,
 * real update entries. Keeps landing-shell pure presentation.
 */

export type LandingSkillCard = {
  slug: string;
  title: string;
  category: string;
  version: string;
  tone: "fresh" | "stale" | "idle";
  updatedAt: string;
  origin: string;
  description: string;
  tags: string[];
};

export type LandingTimelineEntry = {
  version: string;
  date: string;
  summary: string;
  badge?: "model-swap" | "parameter" | "tool-add" | "guardrail";
};

export const LANDING_SKILLS: LandingSkillCard[] = [
  {
    slug: "reasoning-agent",
    title: "Reasoning Agent",
    category: "infra",
    version: "v4",
    tone: "fresh",
    updatedAt: "2 hours ago",
    origin: "auto",
    description: "Chain-of-thought reasoning with eval-gated deploys and source citation.",
    tags: ["reasoning", "chain-of-thought", "eval"],
  },
  {
    slug: "frontend-reviewer",
    title: "Frontend Reviewer",
    category: "frontend",
    version: "v7",
    tone: "fresh",
    updatedAt: "18 min ago",
    origin: "tracked",
    description: "Automated code review for React, Next.js, and Tailwind — catches perf issues.",
    tags: ["react", "next.js", "review"],
  },
  {
    slug: "seo-auditor",
    title: "SEO Auditor",
    category: "seo-geo",
    version: "v3",
    tone: "stale",
    updatedAt: "3 days ago",
    origin: "auto",
    description: "Crawl-based SEO analysis with Core Web Vitals and structured data checks.",
    tags: ["seo", "cwv", "lighthouse"],
  },
  {
    slug: "mcp-orchestrator",
    title: "MCP Orchestrator",
    category: "a2a",
    version: "v5",
    tone: "fresh",
    updatedAt: "45 min ago",
    origin: "tracked",
    description: "Connects GitHub, Notion, and Slack MCPs — routes tool calls across servers in one agent run.",
    tags: ["mcp", "orchestration", "tools"],
  },
];

export const LANDING_TIMELINE: LandingTimelineEntry[] = [
  { version: "v4", date: "2h ago", summary: "Switched engine to gpt-4-turbo, lowered temperature to 0.3", badge: "model-swap" },
  { version: "v3", date: "6h ago", summary: "Added file_analysis and knowledge_retrieval tools", badge: "tool-add" },
  { version: "v2", date: "1d ago", summary: "Enabled sandbox guardrails, set rate limit to 60/min", badge: "guardrail" },
  { version: "v1", date: "3d ago", summary: "Initial creation — chain-of-thought strategy, source citation", badge: "parameter" },
];

export const LANDING_SKILL_TOML = `[model]
name = "reasoning-agent"
engine = "gpt-4-turbo-2025-01"
temperature = 0.3

[behavior]
Follow user instructions.
strategy = "chain-of-thought"
cite_sources = true

[tools]
web_search = true
code_interpreter = true
file_analysis = true
knowledge_retrieval = true

[mcp]
servers = ["github", "filesystem", "brave-search"]
transport = "stdio"
auto_discover = true

[guardrails]
max_tokens = 4096
rate_limit = "60/min"
sandbox = "strict"

[evaluation]
benchmark = "mmlu-pro"
threshold = 0.92
auto_rollback = true

[loop]
interval = "6h"
trigger = "source_change"
notify = ["slack", "email"]
diff_review = "auto"`;

export const LANDING_DIFF_LINES: Array<{ kind: "context" | "added" | "removed"; text: string }> = [
  { kind: "context", text: '[model]' },
  { kind: "context", text: 'name = "reasoning-agent"' },
  { kind: "removed", text: 'engine = "gpt-4"' },
  { kind: "added", text: 'engine = "gpt-4-turbo-2025-01"' },
  { kind: "removed", text: "temperature = 0.7" },
  { kind: "added", text: "temperature = 0.3" },
  { kind: "context", text: "" },
  { kind: "context", text: "[behavior]" },
  { kind: "context", text: "Follow user instructions." },
  { kind: "added", text: 'strategy = "chain-of-thought"' },
  { kind: "added", text: "cite_sources = true" },
];

// ---------------------------------------------------------------------------
// MCP showcase — real servers from the seed catalog
// ---------------------------------------------------------------------------

export type LandingMcpServer = {
  name: string;
  transport: "stdio" | "http";
  category: string;
};

export const LANDING_MCP_SERVERS: LandingMcpServer[] = [
  { name: "GitHub", transport: "stdio", category: "Dev platforms" },
  { name: "Vercel", transport: "http", category: "Dev platforms" },
  { name: "Slack", transport: "http", category: "Productivity" },
  { name: "Notion", transport: "http", category: "Productivity" },
  { name: "Linear", transport: "http", category: "Productivity" },
  { name: "Stripe", transport: "http", category: "Payments" },
  { name: "Figma", transport: "http", category: "Design" },
  { name: "Supabase", transport: "stdio", category: "Databases" },
  { name: "Sentry", transport: "stdio", category: "Observability" },
  { name: "Playwright", transport: "stdio", category: "Browser" },
  { name: "Brave Search", transport: "stdio", category: "Search" },
  { name: "Cloudflare", transport: "stdio", category: "Infra" },
];

export type LandingMcpCapability = {
  label: string;
  mono: string;
};

export const LANDING_MCP_CAPABILITIES: LandingMcpCapability[] = [
  { label: "Import from URL", mono: "manifest.json → catalog" },
  { label: "Runtime execution", mono: "stdio · http transport" },
  { label: "Versioned catalog", mono: "tracked alongside skills" },
];

// ---------------------------------------------------------------------------
// Pipeline steps
// ---------------------------------------------------------------------------

export type LandingStep = {
  id: string;
  label: string;
  mono: string;
  description: string;
};

export const LANDING_PIPELINE_STEPS: LandingStep[] = [
  {
    id: "monitor",
    label: "Monitor",
    mono: "source_change",
    description: "Loop watches repos, docs, APIs, and RSS feeds. When something changes upstream it flags every skill that might need attention.",
  },
  {
    id: "evaluate",
    label: "Evaluate",
    mono: "benchmark",
    description: "An agent proposes targeted updates — model swaps, MCP server wiring, new tool integrations — then runs them through your benchmarks.",
  },
  {
    id: "deploy",
    label: "Deploy",
    mono: "diff_review",
    description: "Only changes that measurably improve get merged. You review a clean diff, approve, and the skill is live — or let auto-merge handle it.",
  },
];
