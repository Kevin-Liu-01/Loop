import type { ImportedMcpTransport } from "@/lib/types";
import { buildVersionLabel } from "@/lib/format";

// ---------------------------------------------------------------------------
// Seed MCP type
// ---------------------------------------------------------------------------

export type SeedMcp = {
  name: string;
  description: string;
  manifestUrl: string;
  homepageUrl?: string;
  transport: ImportedMcpTransport;
  url?: string;
  command?: string;
  args: string[];
  envKeys: string[];
  headers?: Record<string, string>;
  tags: string[];
};

// ---------------------------------------------------------------------------
// Helper to build an ImportedMcpDocument-compatible row
// ---------------------------------------------------------------------------

export function toMcpRow(seed: SeedMcp) {
  const now = new Date().toISOString();
  return {
    name: seed.name,
    description: seed.description,
    manifest_url: seed.manifestUrl,
    homepage_url: seed.homepageUrl ?? null,
    transport: seed.transport,
    url: seed.url ?? null,
    command: seed.command ?? null,
    args: seed.args,
    env_keys: seed.envKeys,
    headers: seed.headers ?? null,
    tags: seed.tags,
    raw: "",
    version: 1,
    version_label: buildVersionLabel(1),
    created_at: now,
    updated_at: now,
  };
}

// ---------------------------------------------------------------------------
// stdio helper — for npm-based MCP servers run via npx
// ---------------------------------------------------------------------------

function stdio(
  name: string,
  description: string,
  pkg: string,
  args: string[],
  opts: {
    manifestUrl: string;
    homepageUrl?: string;
    envKeys?: string[];
    tags: string[];
  }
): SeedMcp {
  return {
    name,
    description,
    manifestUrl: opts.manifestUrl,
    homepageUrl: opts.homepageUrl,
    transport: "stdio",
    command: "npx",
    args: ["-y", pkg, ...args],
    envKeys: opts.envKeys ?? [],
    tags: opts.tags,
  };
}

// ---------------------------------------------------------------------------
// http helper — for remote/hosted MCP servers
// ---------------------------------------------------------------------------

function http(
  name: string,
  description: string,
  url: string,
  opts: {
    manifestUrl: string;
    homepageUrl?: string;
    envKeys?: string[];
    tags: string[];
  }
): SeedMcp {
  return {
    name,
    description,
    manifestUrl: opts.manifestUrl,
    homepageUrl: opts.homepageUrl,
    transport: "http",
    url,
    command: undefined,
    args: [],
    envKeys: opts.envKeys ?? [],
    tags: opts.tags,
  };
}

// ===========================================================================
// Official Reference Servers (Anthropic / MCP org)
// ===========================================================================

const officialReference: SeedMcp[] = [
  stdio(
    "Filesystem",
    "Secure file operations with configurable access controls. Read, write, move, search, and get metadata for files and directories.",
    "@modelcontextprotocol/server-filesystem",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem",
      homepageUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
      tags: ["official", "filesystem", "files", "developer-tools"],
    }
  ),
  stdio(
    "Memory",
    "Knowledge graph-based persistent memory system. Create entities, relations, and observations that persist across sessions.",
    "@modelcontextprotocol/server-memory",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-memory",
      homepageUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
      tags: ["official", "memory", "knowledge-graph", "persistence"],
    }
  ),
  stdio(
    "Sequential Thinking",
    "Structured step-by-step reasoning for complex problem solving. Break down problems, revise thoughts, and branch into alternative paths.",
    "@modelcontextprotocol/server-sequential-thinking",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-sequential-thinking",
      homepageUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
      tags: ["official", "reasoning", "thinking", "problem-solving"],
    }
  ),
  stdio(
    "Fetch",
    "Web content fetching and conversion for LLM consumption. Retrieve and transform web pages into clean markdown.",
    "@modelcontextprotocol/server-fetch",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-fetch",
      homepageUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
      tags: ["official", "fetch", "web", "scraping"],
    }
  ),
  stdio(
    "Git",
    "Git repository operations including status, diff, log, commit, branch management, and file operations across local repos.",
    "@modelcontextprotocol/server-git",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-git",
      homepageUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
      tags: ["official", "git", "version-control", "developer-tools"],
    }
  ),
];

// ===========================================================================
// Developer Platform & DevOps
// ===========================================================================

const devPlatforms: SeedMcp[] = [
  stdio(
    "GitHub",
    "Full GitHub integration: search repos, manage issues and PRs, read files, create branches, review Actions runs, and more.",
    "@github/mcp-server",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@github/mcp-server",
      homepageUrl: "https://github.com/github/github-mcp-server",
      envKeys: ["GITHUB_PERSONAL_ACCESS_TOKEN"],
      tags: ["github", "git", "issues", "pull-requests", "developer-tools"],
    }
  ),
  http(
    "Vercel",
    "Manage Vercel projects, deployments, domains, environment variables, and logs. Search documentation and analyze deploy output.",
    "https://mcp.vercel.com/mcp",
    {
      manifestUrl: "https://mcp.vercel.com",
      homepageUrl: "https://vercel.com/docs/mcp",
      tags: ["vercel", "deployment", "hosting", "developer-tools"],
    }
  ),
  stdio(
    "Cloudflare",
    "Manage Cloudflare Workers, KV, R2, D1, Durable Objects, Queues, and Workers AI through natural language.",
    "@cloudflare/mcp-server-cloudflare",
    ["init"],
    {
      manifestUrl: "https://www.npmjs.com/package/@cloudflare/mcp-server-cloudflare",
      homepageUrl: "https://github.com/cloudflare/mcp-server-cloudflare",
      envKeys: ["CLOUDFLARE_API_TOKEN"],
      tags: ["cloudflare", "workers", "edge", "r2", "kv", "d1", "infra"],
    }
  ),
  stdio(
    "Sentry",
    "Access Sentry issues, errors, projects, and AI-powered Seer analysis. Debug production errors with full context.",
    "@sentry/mcp-server",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@sentry/mcp-server",
      homepageUrl: "https://docs.sentry.io/product/sentry-mcp",
      envKeys: ["SENTRY_AUTH_TOKEN"],
      tags: ["sentry", "error-tracking", "debugging", "observability"],
    }
  ),
];

// ===========================================================================
// Databases
// ===========================================================================

const databases: SeedMcp[] = [
  stdio(
    "Supabase",
    "Query Supabase databases, manage auth, inspect schemas, and deploy edge functions with natural language.",
    "@supabase/mcp-server-supabase",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@supabase/mcp-server-supabase",
      homepageUrl: "https://github.com/supabase-community/supabase-mcp",
      envKeys: ["SUPABASE_ACCESS_TOKEN"],
      tags: ["supabase", "postgres", "database", "auth", "backend"],
    }
  ),
  stdio(
    "Neon",
    "Manage Neon Postgres databases, branches, and run queries via natural language. Supports branching for safe migrations.",
    "@neondatabase/mcp-server-neon",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@neondatabase/mcp-server-neon",
      homepageUrl: "https://neon.tech/docs/mcp",
      envKeys: ["NEON_API_KEY"],
      tags: ["neon", "postgres", "database", "serverless", "branching"],
    }
  ),
  stdio(
    "Prisma",
    "Manage Prisma Postgres databases with migration support, schema introspection, SQL execution, and backup creation.",
    "prisma",
    ["mcp"],
    {
      manifestUrl: "https://www.npmjs.com/package/prisma",
      homepageUrl: "https://www.prisma.io/docs/postgres/mcp-server",
      tags: ["prisma", "postgres", "database", "orm", "migrations"],
    }
  ),
  stdio(
    "Turso",
    "Interact with Turso/libSQL databases: list tables, inspect schemas, and run queries with edge-first SQLite.",
    "mcp-turso",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/mcp-turso",
      homepageUrl: "https://github.com/spences10/mcp-turso-cloud",
      envKeys: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"],
      tags: ["turso", "sqlite", "libsql", "database", "edge"],
    }
  ),
  stdio(
    "Upstash",
    "Interact with Upstash Redis databases, QStash message queues, and Workflow management from your AI editor.",
    "@upstash/mcp-server",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@upstash/mcp-server",
      homepageUrl: "https://github.com/upstash/mcp-server",
      envKeys: ["UPSTASH_EMAIL", "UPSTASH_API_KEY"],
      tags: ["upstash", "redis", "qstash", "serverless", "cache"],
    }
  ),
];

// ===========================================================================
// Search & Research
// ===========================================================================

const searchResearch: SeedMcp[] = [
  stdio(
    "Context7",
    "Inject version-specific, up-to-date code documentation directly into prompts. Eliminates hallucinated API examples.",
    "@upstash/context7-mcp",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@upstash/context7-mcp",
      homepageUrl: "https://context7.com",
      tags: ["context7", "documentation", "docs", "api-reference", "search"],
    }
  ),
  stdio(
    "Brave Search",
    "Real-time web search, local business search, image/video/news search, and AI summarization via Brave's index.",
    "@brave/brave-search-mcp-server",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@brave/brave-search-mcp-server",
      homepageUrl: "https://github.com/brave/brave-search-mcp-server",
      envKeys: ["BRAVE_API_KEY"],
      tags: ["brave", "search", "web-search", "research"],
    }
  ),
  http(
    "Exa",
    "AI-native web search, code search, and company research. Supports semantic search and content extraction.",
    "https://mcp.exa.ai/mcp",
    {
      manifestUrl: "https://www.npmjs.com/package/exa-mcp-server",
      homepageUrl: "https://exa.ai",
      envKeys: ["EXA_API_KEY"],
      tags: ["exa", "search", "semantic-search", "research", "ai"],
    }
  ),
  stdio(
    "Firecrawl",
    "Web scraping, crawling, search, batch processing, structured data extraction, and LLM-powered analysis.",
    "firecrawl-mcp",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/firecrawl-mcp",
      homepageUrl: "https://firecrawl.dev",
      envKeys: ["FIRECRAWL_API_KEY"],
      tags: ["firecrawl", "scraping", "crawling", "extraction", "research"],
    }
  ),
];

// ===========================================================================
// Browser Automation
// ===========================================================================

const browserAutomation: SeedMcp[] = [
  stdio(
    "Playwright",
    "Browser automation using accessibility snapshots. Navigate pages, fill forms, click elements, take screenshots, and extract content.",
    "@playwright/mcp",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@playwright/mcp",
      homepageUrl: "https://github.com/playwright-community/mcp",
      tags: ["playwright", "browser", "automation", "testing", "e2e"],
    }
  ),
  stdio(
    "Puppeteer",
    "Browser automation with Puppeteer: navigate, screenshot, click, fill, select, hover, and evaluate JavaScript in the browser.",
    "@anthropic/mcp-server-puppeteer",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@anthropic/mcp-server-puppeteer",
      homepageUrl: "https://github.com/anthropics/mcp-server-puppeteer",
      tags: ["puppeteer", "browser", "automation", "scraping"],
    }
  ),
];

// ===========================================================================
// Productivity & Collaboration
// ===========================================================================

const productivity: SeedMcp[] = [
  http(
    "Notion",
    "Create pages, query databases, search workspace, and manage content in Notion. 22 tools for full workspace access.",
    "https://mcp.notion.so/mcp",
    {
      manifestUrl: "https://www.npmjs.com/package/@notionhq/notion-mcp-server",
      homepageUrl: "https://developers.notion.com",
      tags: ["notion", "productivity", "wiki", "databases", "collaboration"],
    }
  ),
  http(
    "Slack",
    "Search messages, users, channels, and files. Send messages, manage canvases, and access profiles in your Slack workspace.",
    "https://mcp.slack.com/mcp",
    {
      manifestUrl: "https://mcp.slack.com",
      homepageUrl: "https://api.slack.com",
      tags: ["slack", "messaging", "team", "collaboration"],
    }
  ),
  http(
    "Linear",
    "Create and update issues, manage projects and cycles, add comments, and search docs across your Linear workspace. 23+ tools.",
    "https://mcp.linear.app/mcp",
    {
      manifestUrl: "https://mcp.linear.app",
      homepageUrl: "https://linear.app/docs/mcp",
      tags: ["linear", "project-management", "issues", "agile"],
    }
  ),
  stdio(
    "Todoist",
    "Task and project management: create tasks, organize projects, manage labels, sections, reminders, and batch operations.",
    "@shayonpal/mcp-todoist",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@shayonpal/mcp-todoist",
      homepageUrl: "https://todoist.com",
      envKeys: ["TODOIST_API_TOKEN"],
      tags: ["todoist", "tasks", "productivity", "project-management"],
    }
  ),
];

// ===========================================================================
// Payments & Commerce
// ===========================================================================

const payments: SeedMcp[] = [
  http(
    "Stripe",
    "Interact with the Stripe API for payments, subscriptions, customers, and invoices. Search Stripe's knowledge base.",
    "https://mcp.stripe.com",
    {
      manifestUrl: "https://www.npmjs.com/package/@stripe/mcp",
      homepageUrl: "https://docs.stripe.com/mcp",
      envKeys: ["STRIPE_SECRET_KEY"],
      tags: ["stripe", "payments", "billing", "subscriptions", "commerce"],
    }
  ),
];

// ===========================================================================
// Design
// ===========================================================================

const design: SeedMcp[] = [
  http(
    "Figma",
    "Extract design context from Figma, generate code from frames, and write to the canvas. Bridge design and development.",
    "https://mcp.figma.com/mcp",
    {
      manifestUrl: "https://mcp.figma.com",
      homepageUrl: "https://figma.com",
      envKeys: ["FIGMA_ACCESS_TOKEN"],
      tags: ["figma", "design", "ui", "prototyping", "design-to-code"],
    }
  ),
];

// ===========================================================================
// Email & Communications
// ===========================================================================

const email: SeedMcp[] = [
  stdio(
    "Resend",
    "Send, list, and manage emails, contacts, broadcasts, domains, and webhooks via the Resend API.",
    "resend-mcp",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/resend-mcp",
      homepageUrl: "https://resend.com/docs/mcp-server",
      envKeys: ["RESEND_API_KEY"],
      tags: ["resend", "email", "transactional", "communications"],
    }
  ),
];

// ===========================================================================
// Observability
// ===========================================================================

const observability: SeedMcp[] = [
  {
    name: "Grafana",
    description:
      "40+ tools across 15 categories: dashboard management, Prometheus, Loki logs, alerting, incident management, and OnCall.",
    manifestUrl: "https://github.com/grafana/mcp-grafana",
    homepageUrl: "https://grafana.com",
    transport: "stdio",
    command: "uvx",
    args: ["mcp-grafana"],
    envKeys: ["GRAFANA_URL", "GRAFANA_API_KEY"],
    tags: ["grafana", "observability", "monitoring", "prometheus", "loki"],
  },
];

// ===========================================================================
// AI Providers
// ===========================================================================

const aiProviders: SeedMcp[] = [
  stdio(
    "OpenAI Agents",
    "Run and manage OpenAI agent workflows, completions, and assistants from your MCP client.",
    "@openai/mcp-server",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@openai/mcp-server",
      homepageUrl: "https://platform.openai.com",
      envKeys: ["OPENAI_API_KEY"],
      tags: ["openai", "ai", "llm", "agents", "completions"],
    }
  ),
];

// ===========================================================================
// Data & Analytics
// ===========================================================================

const dataAnalytics: SeedMcp[] = [
  stdio(
    "PostgreSQL",
    "Direct Postgres database access: run queries, inspect schemas, list tables, and explore database structure.",
    "@modelcontextprotocol/server-postgres",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres",
      homepageUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
      envKeys: ["POSTGRES_CONNECTION_STRING"],
      tags: ["postgres", "database", "sql", "official"],
    }
  ),
  stdio(
    "SQLite",
    "Local SQLite database access with business intelligence capabilities. Query, analyze, and create memo tables.",
    "@modelcontextprotocol/server-sqlite",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-sqlite",
      homepageUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite",
      tags: ["sqlite", "database", "sql", "local", "official"],
    }
  ),
];

// ===========================================================================
// Infrastructure & Cloud
// ===========================================================================

const infraCloud: SeedMcp[] = [
  stdio(
    "AWS",
    "Interact with AWS services including S3, Lambda, DynamoDB, EC2, and CloudFormation through natural language.",
    "aws-mcp-server",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/aws-mcp-server",
      homepageUrl: "https://aws.amazon.com",
      envKeys: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
      tags: ["aws", "cloud", "s3", "lambda", "infra"],
    }
  ),
  stdio(
    "Terraform",
    "Manage Terraform configurations, plan and apply infrastructure changes, and inspect state through MCP.",
    "terraform-mcp-server",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/terraform-mcp-server",
      homepageUrl: "https://www.terraform.io",
      tags: ["terraform", "iac", "infrastructure", "devops"],
    }
  ),
  stdio(
    "Docker",
    "Manage Docker containers, images, volumes, and networks. Build, run, and inspect containerized applications.",
    "docker-mcp-server",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/docker-mcp-server",
      homepageUrl: "https://www.docker.com",
      tags: ["docker", "containers", "devops", "infrastructure"],
    }
  ),
  stdio(
    "Kubernetes",
    "Manage Kubernetes clusters, deployments, services, and pods. Apply manifests and inspect cluster state.",
    "kubernetes-mcp-server",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/kubernetes-mcp-server",
      homepageUrl: "https://kubernetes.io",
      envKeys: ["KUBECONFIG"],
      tags: ["kubernetes", "k8s", "containers", "orchestration", "infra"],
    }
  ),
];

// ===========================================================================
// Security
// ===========================================================================

const security: SeedMcp[] = [
  stdio(
    "Snyk",
    "Scan code and dependencies for vulnerabilities. Get security advisories, fix recommendations, and license compliance.",
    "snyk-mcp-server",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/snyk-mcp-server",
      homepageUrl: "https://snyk.io",
      envKeys: ["SNYK_TOKEN"],
      tags: ["snyk", "security", "vulnerabilities", "dependencies", "sca"],
    }
  ),
];

// ===========================================================================
// Utilities
// ===========================================================================

const utilities: SeedMcp[] = [
  stdio(
    "MCP Proxy",
    "Expose any stdio-based MCP server over Streamable HTTP or SSE. Bridge local tools to remote clients.",
    "mcp-proxy",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/mcp-proxy",
      homepageUrl: "https://github.com/nicobailey/mcp-proxy",
      tags: ["proxy", "transport", "http", "sse", "utility"],
    }
  ),
  stdio(
    "Time",
    "Time and timezone conversion utilities. Get current time in any timezone and convert between timezones.",
    "@modelcontextprotocol/server-time",
    [],
    {
      manifestUrl: "https://www.npmjs.com/package/@modelcontextprotocol/server-time",
      homepageUrl: "https://github.com/modelcontextprotocol/servers/tree/main/src/time",
      tags: ["time", "timezone", "utility", "official"],
    }
  ),
];

// ===========================================================================
// Aggregate export
// ===========================================================================

export const SEED_MCP_DEFINITIONS: SeedMcp[] = [
  ...officialReference,
  ...devPlatforms,
  ...databases,
  ...searchResearch,
  ...browserAutomation,
  ...productivity,
  ...payments,
  ...design,
  ...email,
  ...observability,
  ...aiProviders,
  ...dataAnalytics,
  ...infraCloud,
  ...security,
  ...utilities,
];
