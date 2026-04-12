import { buildVersionLabel } from "@/lib/format";
import type { ImportedMcpTransport } from "@/lib/types";

// ---------------------------------------------------------------------------
// Seed MCP type
// ---------------------------------------------------------------------------

export interface SeedMcp {
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
}

// ---------------------------------------------------------------------------
// Helper to build an ImportedMcpDocument-compatible row
// ---------------------------------------------------------------------------

export function toMcpRow(seed: SeedMcp) {
  const now = new Date().toISOString();
  return {
    args: seed.args,
    command: seed.command ?? null,
    created_at: now,
    description: seed.description,
    env_keys: seed.envKeys,
    headers: seed.headers ?? null,
    homepage_url: seed.homepageUrl ?? null,
    manifest_url: seed.manifestUrl,
    name: seed.name,
    raw: "",
    tags: seed.tags,
    transport: seed.transport,
    updated_at: now,
    url: seed.url ?? null,
    version: 1,
    version_label: buildVersionLabel(1),
  };
}

// ---------------------------------------------------------------------------
// stdio helper – for npm-based MCP servers run via npx
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
    args: ["-y", pkg, ...args],
    command: "npx",
    description,
    envKeys: opts.envKeys ?? [],
    homepageUrl: opts.homepageUrl,
    manifestUrl: opts.manifestUrl,
    name,
    tags: opts.tags,
    transport: "stdio",
  };
}

// ---------------------------------------------------------------------------
// uvx helper – for Python-based MCP servers run via uvx
// ---------------------------------------------------------------------------

function uvx(
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
    args: [`${pkg}@latest`, ...args],
    command: "uvx",
    description,
    envKeys: opts.envKeys ?? [],
    homepageUrl: opts.homepageUrl,
    manifestUrl: opts.manifestUrl,
    name,
    tags: opts.tags,
    transport: "stdio",
  };
}

// ---------------------------------------------------------------------------
// http helper – for remote/hosted MCP servers
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
    args: [],
    command: undefined,
    description,
    envKeys: opts.envKeys ?? [],
    homepageUrl: opts.homepageUrl,
    manifestUrl: opts.manifestUrl,
    name,
    tags: opts.tags,
    transport: "http",
    url,
  };
}

// ===========================================================================
// Official Reference Servers (Anthropic / MCP org)
// ===========================================================================

const officialReference: SeedMcp[] = [
  stdio(
    "Everything",
    "Reference and test server demonstrating all MCP features: prompts, resources, tools, sampling, and logging.",
    "@modelcontextprotocol/server-everything",
    [],
    {
      homepageUrl:
        "https://github.com/modelcontextprotocol/servers/tree/main/src/everything",
      manifestUrl:
        "https://www.npmjs.com/package/@modelcontextprotocol/server-everything",
      tags: ["official", "reference", "testing", "developer-tools"],
    }
  ),
  stdio(
    "Filesystem",
    "Secure file operations with configurable access controls. Read, write, move, search, and get metadata for files and directories.",
    "@modelcontextprotocol/server-filesystem",
    [],
    {
      homepageUrl:
        "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
      manifestUrl:
        "https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem",
      tags: ["official", "filesystem", "files", "developer-tools"],
    }
  ),
  stdio(
    "Memory",
    "Knowledge graph-based persistent memory system. Create entities, relations, and observations that persist across sessions.",
    "@modelcontextprotocol/server-memory",
    [],
    {
      homepageUrl:
        "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
      manifestUrl:
        "https://www.npmjs.com/package/@modelcontextprotocol/server-memory",
      tags: ["official", "memory", "knowledge-graph", "persistence"],
    }
  ),
  stdio(
    "Sequential Thinking",
    "Structured step-by-step reasoning for complex problem solving. Break down problems, revise thoughts, and branch into alternative paths.",
    "@modelcontextprotocol/server-sequential-thinking",
    [],
    {
      homepageUrl:
        "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
      manifestUrl:
        "https://www.npmjs.com/package/@modelcontextprotocol/server-sequential-thinking",
      tags: ["official", "reasoning", "thinking", "problem-solving"],
    }
  ),
  stdio(
    "Fetch",
    "Web content fetching and conversion for LLM consumption. Retrieve and transform web pages into clean markdown.",
    "@modelcontextprotocol/server-fetch",
    [],
    {
      homepageUrl:
        "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
      manifestUrl:
        "https://www.npmjs.com/package/@modelcontextprotocol/server-fetch",
      tags: ["official", "fetch", "web", "scraping"],
    }
  ),
  stdio(
    "Git",
    "Git repository operations including status, diff, log, commit, branch management, and file operations across local repos.",
    "@modelcontextprotocol/server-git",
    [],
    {
      homepageUrl:
        "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
      manifestUrl:
        "https://www.npmjs.com/package/@modelcontextprotocol/server-git",
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
      envKeys: ["GITHUB_PERSONAL_ACCESS_TOKEN"],
      homepageUrl: "https://github.com/github/github-mcp-server",
      manifestUrl: "https://www.npmjs.com/package/@github/mcp-server",
      tags: ["github", "git", "issues", "pull-requests", "developer-tools"],
    }
  ),
  http(
    "GitLab",
    "GitLab's official MCP server for project data, issue management, and repository operations via OAuth 2.0.",
    "https://gitlab.com/-/mcp",
    {
      homepageUrl: "https://gitlab.com",
      manifestUrl:
        "https://docs.gitlab.com/user/gitlab_duo/model_context_protocol/mcp_server/",
      tags: ["gitlab", "git", "issues", "developer-tools"],
    }
  ),
  http(
    "Vercel",
    "Manage Vercel projects, deployments, domains, environment variables, and logs. Search documentation and analyze deploy output.",
    "https://mcp.vercel.com/mcp",
    {
      homepageUrl: "https://vercel.com/docs/mcp",
      manifestUrl: "https://mcp.vercel.com",
      tags: ["vercel", "deployment", "hosting", "developer-tools"],
    }
  ),
  stdio(
    "Cloudflare",
    "Manage Cloudflare Workers, KV, R2, D1, Durable Objects, Queues, and Workers AI through natural language.",
    "@cloudflare/mcp-server-cloudflare",
    ["init"],
    {
      envKeys: ["CLOUDFLARE_API_TOKEN"],
      homepageUrl: "https://github.com/cloudflare/mcp-server-cloudflare",
      manifestUrl:
        "https://www.npmjs.com/package/@cloudflare/mcp-server-cloudflare",
      tags: ["cloudflare", "workers", "edge", "r2", "kv", "d1", "infra"],
    }
  ),
  http(
    "Netlify",
    "Create, build, deploy, and manage websites with the Netlify web platform. Full project and deploy lifecycle.",
    "https://mcp.netlify.com/mcp",
    {
      homepageUrl: "https://netlify.com",
      manifestUrl:
        "https://docs.netlify.com/welcome/build-with-ai/netlify-mcp-server/",
      tags: ["netlify", "deployment", "hosting", "developer-tools"],
    }
  ),
  stdio(
    "Heroku",
    "Interact with the Heroku Platform: manage apps, add-ons, dynos, databases, and more through LLM-driven tools.",
    "heroku-mcp-server",
    [],
    {
      homepageUrl: "https://heroku.com",
      manifestUrl: "https://github.com/heroku/heroku-mcp-server",
      tags: ["heroku", "deployment", "hosting", "developer-tools"],
    }
  ),
  stdio(
    "Sentry",
    "Access Sentry issues, errors, projects, and AI-powered Seer analysis. Debug production errors with full context.",
    "@sentry/mcp-server",
    [],
    {
      envKeys: ["SENTRY_AUTH_TOKEN"],
      homepageUrl: "https://docs.sentry.io/ai/mcp/",
      manifestUrl: "https://www.npmjs.com/package/@sentry/mcp-server",
      tags: ["sentry", "error-tracking", "debugging", "observability"],
    }
  ),
  stdio(
    "CircleCI",
    "Enable AI agents to fix build failures, inspect pipelines, jobs, and test results from CircleCI.",
    "circleci-mcp-server",
    [],
    {
      envKeys: ["CIRCLECI_TOKEN"],
      homepageUrl: "https://circleci.com",
      manifestUrl: "https://github.com/CircleCI-Public/mcp-server-circleci",
      tags: ["circleci", "ci-cd", "builds", "developer-tools"],
    }
  ),
  stdio(
    "Storybook",
    "Interact with Storybook to automate UI component testing, documentation, and visual regression checks.",
    "@storybook/addon-mcp",
    [],
    {
      homepageUrl: "https://storybook.js.org",
      manifestUrl: "https://github.com/storybookjs/mcp",
      tags: ["storybook", "ui", "testing", "components", "developer-tools"],
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
      envKeys: ["SUPABASE_ACCESS_TOKEN"],
      homepageUrl: "https://github.com/supabase-community/supabase-mcp",
      manifestUrl:
        "https://www.npmjs.com/package/@supabase/mcp-server-supabase",
      tags: ["supabase", "postgres", "database", "auth", "backend"],
    }
  ),
  stdio(
    "Neon",
    "Manage Neon Postgres databases, branches, and run queries via natural language. Supports branching for safe migrations.",
    "@neondatabase/mcp-server-neon",
    [],
    {
      envKeys: ["NEON_API_KEY"],
      homepageUrl: "https://neon.tech/docs/introduction/mcp",
      manifestUrl:
        "https://www.npmjs.com/package/@neondatabase/mcp-server-neon",
      tags: ["neon", "postgres", "database", "serverless", "branching"],
    }
  ),
  stdio(
    "Prisma",
    "Manage Prisma Postgres databases with migration support, schema introspection, SQL execution, and backup creation.",
    "prisma",
    ["mcp"],
    {
      homepageUrl: "https://www.prisma.io/docs/ai/tools/mcp-server",
      manifestUrl: "https://www.npmjs.com/package/prisma",
      tags: ["prisma", "postgres", "database", "orm", "migrations"],
    }
  ),
  stdio(
    "Turso",
    "Interact with Turso/libSQL databases: list tables, inspect schemas, and run queries with edge-first SQLite.",
    "mcp-turso",
    [],
    {
      envKeys: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"],
      homepageUrl: "https://github.com/spences10/mcp-turso-cloud",
      manifestUrl: "https://www.npmjs.com/package/mcp-turso",
      tags: ["turso", "sqlite", "libsql", "database", "edge"],
    }
  ),
  stdio(
    "Upstash",
    "Interact with Upstash Redis databases, QStash message queues, and Workflow management from your AI editor.",
    "@upstash/mcp-server",
    [],
    {
      envKeys: ["UPSTASH_EMAIL", "UPSTASH_API_KEY"],
      homepageUrl: "https://github.com/upstash/mcp-server",
      manifestUrl: "https://www.npmjs.com/package/@upstash/mcp-server",
      tags: ["upstash", "redis", "qstash", "serverless", "cache"],
    }
  ),
  stdio(
    "MongoDB",
    "MongoDB Community Server and Atlas: query collections, manage databases, create indexes, and run aggregation pipelines.",
    "mongodb-mcp-server",
    [],
    {
      envKeys: ["MONGODB_CONNECTION_STRING"],
      homepageUrl: "https://mongodb.com",
      manifestUrl: "https://github.com/mongodb-js/mongodb-mcp-server",
      tags: ["mongodb", "database", "nosql", "atlas"],
    }
  ),
  stdio(
    "ClickHouse",
    "Query your ClickHouse database server. Run analytical queries, inspect schemas, and explore OLAP data.",
    "@clickhouse/mcp-clickhouse",
    [],
    {
      envKeys: ["CLICKHOUSE_URL", "CLICKHOUSE_USER", "CLICKHOUSE_PASSWORD"],
      homepageUrl: "https://clickhouse.com",
      manifestUrl: "https://github.com/ClickHouse/mcp-clickhouse",
      tags: ["clickhouse", "database", "analytics", "olap"],
    }
  ),
  stdio(
    "Redis",
    "The official Redis MCP server for managing and searching data in Redis. Supports key-value ops, search, and JSON.",
    "@redis/mcp-server",
    [],
    {
      envKeys: ["REDIS_URL"],
      homepageUrl: "https://redis.io",
      manifestUrl: "https://github.com/redis/mcp-redis",
      tags: ["redis", "database", "cache", "search"],
    }
  ),
  stdio(
    "Neo4j",
    "Neo4j graph database server: schema inspection, read/write Cypher queries, and graph-backed memory for agents.",
    "neo4j-mcp-server",
    [],
    {
      envKeys: ["NEO4J_URI", "NEO4J_USER", "NEO4J_PASSWORD"],
      homepageUrl: "https://neo4j.com",
      manifestUrl: "https://github.com/neo4j-contrib/mcp-neo4j",
      tags: ["neo4j", "database", "graph", "cypher"],
    }
  ),
  stdio(
    "Elasticsearch",
    "Query your data in Elasticsearch: full-text search, aggregations, schema inspection, and index management.",
    "@elastic/mcp-server-elasticsearch",
    [],
    {
      envKeys: ["ELASTICSEARCH_URL", "ELASTICSEARCH_API_KEY"],
      homepageUrl: "https://elastic.co/elasticsearch",
      manifestUrl: "https://github.com/elastic/mcp-server-elasticsearch",
      tags: ["elasticsearch", "database", "search", "analytics"],
    }
  ),
  stdio(
    "MariaDB",
    "Standard SQL operations and advanced vector/embedding-based search for MariaDB databases.",
    "mariadb-mcp-server",
    [],
    {
      envKeys: ["MARIADB_CONNECTION_STRING"],
      homepageUrl: "https://mariadb.com",
      manifestUrl: "https://github.com/mariadb/mcp",
      tags: ["mariadb", "database", "sql", "vectors"],
    }
  ),
];

// ===========================================================================
// Vector Databases
// ===========================================================================

const vectorDbs: SeedMcp[] = [
  stdio(
    "Pinecone",
    "Pinecone vector database: search documentation, manage indexes, upsert and query vectors in your development environment.",
    "pinecone-mcp",
    [],
    {
      envKeys: ["PINECONE_API_KEY"],
      homepageUrl: "https://pinecone.io",
      manifestUrl: "https://github.com/pinecone-io/pinecone-mcp",
      tags: ["pinecone", "database", "vectors", "embeddings", "ai"],
    }
  ),
  stdio(
    "Qdrant",
    "Semantic memory layer on top of Qdrant vector search engine. Store, search, and manage vector collections.",
    "mcp-server-qdrant",
    [],
    {
      envKeys: ["QDRANT_URL", "QDRANT_API_KEY"],
      homepageUrl: "https://qdrant.tech",
      manifestUrl: "https://github.com/qdrant/mcp-server-qdrant",
      tags: ["qdrant", "database", "vectors", "search", "ai"],
    }
  ),
  stdio(
    "Chroma",
    "Embeddings, vector search, document storage, and full-text search with the open-source AI application database.",
    "chroma-mcp",
    [],
    {
      homepageUrl: "https://trychroma.com",
      manifestUrl: "https://github.com/chroma-core/chroma-mcp",
      tags: ["chroma", "database", "vectors", "embeddings", "ai"],
    }
  ),
  stdio(
    "Milvus",
    "Search, query, and interact with data in your Milvus Vector Database. Manage collections and run similarity search.",
    "mcp-server-milvus",
    [],
    {
      envKeys: ["MILVUS_ADDRESS"],
      homepageUrl: "https://milvus.io",
      manifestUrl: "https://github.com/zilliztech/mcp-server-milvus",
      tags: ["milvus", "database", "vectors", "search", "ai"],
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
      homepageUrl: "https://context7.com",
      manifestUrl: "https://www.npmjs.com/package/@upstash/context7-mcp",
      tags: ["context7", "documentation", "docs", "api-reference", "search"],
    }
  ),
  stdio(
    "Brave Search",
    "Real-time web search, local business search, image/video/news search, and AI summarization via Brave's index.",
    "@brave/brave-search-mcp-server",
    [],
    {
      envKeys: ["BRAVE_API_KEY"],
      homepageUrl: "https://github.com/brave/brave-search-mcp-server",
      manifestUrl:
        "https://www.npmjs.com/package/@brave/brave-search-mcp-server",
      tags: ["brave", "search", "web-search", "research"],
    }
  ),
  http(
    "Exa",
    "AI-native web search, code search, and company research. Supports semantic search and content extraction.",
    "https://mcp.exa.ai/mcp",
    {
      envKeys: ["EXA_API_KEY"],
      homepageUrl: "https://exa.ai",
      manifestUrl: "https://www.npmjs.com/package/exa-mcp-server",
      tags: ["exa", "search", "semantic-search", "research", "ai"],
    }
  ),
  stdio(
    "Firecrawl",
    "Web scraping, crawling, search, batch processing, structured data extraction, and LLM-powered analysis.",
    "firecrawl-mcp",
    [],
    {
      envKeys: ["FIRECRAWL_API_KEY"],
      homepageUrl: "https://firecrawl.dev",
      manifestUrl: "https://www.npmjs.com/package/firecrawl-mcp",
      tags: ["firecrawl", "scraping", "crawling", "extraction", "research"],
    }
  ),
  stdio(
    "Perplexity",
    "Real-time web-wide research using Perplexity's Sonar API. Conversational AI-powered search with citations.",
    "perplexity-mcp",
    [],
    {
      envKeys: ["PERPLEXITY_API_KEY"],
      homepageUrl: "https://www.perplexity.ai",
      manifestUrl: "https://github.com/perplexityai/modelcontextprotocol",
      tags: ["perplexity", "search", "research", "ai"],
    }
  ),
  stdio(
    "Apify",
    "Use 6,000+ pre-built cloud tools to extract data from websites, e-commerce, social media, search engines, and maps.",
    "apify-mcp-server",
    [],
    {
      envKeys: ["APIFY_TOKEN"],
      homepageUrl: "https://apify.com",
      manifestUrl: "https://github.com/apify/apify-mcp-server",
      tags: ["apify", "scraping", "extraction", "research", "automation"],
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
      homepageUrl: "https://github.com/microsoft/playwright-mcp",
      manifestUrl: "https://www.npmjs.com/package/@playwright/mcp",
      tags: ["playwright", "browser", "automation", "testing", "e2e"],
    }
  ),
  stdio(
    "Puppeteer",
    "Browser automation with Puppeteer: navigate, screenshot, click, fill, select, hover, and evaluate JavaScript in the browser.",
    "@anthropic/mcp-server-puppeteer",
    [],
    {
      homepageUrl:
        "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
      manifestUrl:
        "https://www.npmjs.com/package/@anthropic/mcp-server-puppeteer",
      tags: ["puppeteer", "browser", "automation", "scraping"],
    }
  ),
  stdio(
    "Browserbase",
    "Automate browser interactions in the cloud: web navigation, data extraction, form filling, and more.",
    "@browserbase/mcp-server-browserbase",
    [],
    {
      envKeys: ["BROWSERBASE_API_KEY"],
      homepageUrl: "https://browserbase.com",
      manifestUrl: "https://github.com/browserbase/mcp-server-browserbase",
      tags: ["browserbase", "browser", "automation", "cloud"],
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
      homepageUrl: "https://developers.notion.com",
      manifestUrl: "https://www.npmjs.com/package/@notionhq/notion-mcp-server",
      tags: ["notion", "productivity", "wiki", "databases", "collaboration"],
    }
  ),
  http(
    "Slack",
    "Search messages, users, channels, and files. Send messages, manage canvases, and access profiles in your Slack workspace.",
    "https://mcp.slack.com/mcp",
    {
      homepageUrl: "https://api.slack.com",
      manifestUrl: "https://mcp.slack.com",
      tags: ["slack", "messaging", "team", "collaboration"],
    }
  ),
  http(
    "Linear",
    "Create and update issues, manage projects and cycles, add comments, and search docs across your Linear workspace. 23+ tools.",
    "https://mcp.linear.app/mcp",
    {
      homepageUrl: "https://linear.app/docs/mcp",
      manifestUrl: "https://mcp.linear.app",
      tags: ["linear", "project-management", "issues", "agile"],
    }
  ),
  stdio(
    "Todoist",
    "Task and project management: create tasks, organize projects, manage labels, sections, reminders, and batch operations.",
    "@shayonpal/mcp-todoist",
    [],
    {
      envKeys: ["TODOIST_API_TOKEN"],
      homepageUrl: "https://todoist.com",
      manifestUrl: "https://www.npmjs.com/package/@shayonpal/mcp-todoist",
      tags: ["todoist", "tasks", "productivity", "project-management"],
    }
  ),
  http(
    "Atlassian",
    "Securely interact with Jira work items and Confluence pages, and search across both. Official Atlassian MCP server.",
    "https://www.atlassian.com/platform/remote-mcp-server",
    {
      homepageUrl: "https://atlassian.com",
      manifestUrl: "https://www.atlassian.com/platform/remote-mcp-server",
      tags: [
        "atlassian",
        "jira",
        "confluence",
        "productivity",
        "project-management",
      ],
    }
  ),
  http(
    "HubSpot",
    "Connect, manage, and interact with HubSpot CRM data: contacts, companies, deals, tickets, and marketing assets.",
    "https://developer.hubspot.com/mcp",
    {
      homepageUrl: "https://hubspot.com",
      manifestUrl: "https://developer.hubspot.com/mcp",
      tags: ["hubspot", "crm", "marketing", "sales", "productivity"],
    }
  ),
  stdio(
    "Monday.com",
    "Interact with Monday.com boards, items, accounts, and work forms. Full project management integration.",
    "monday-mcp-server",
    [],
    {
      envKeys: ["MONDAY_API_TOKEN"],
      homepageUrl: "https://monday.com",
      manifestUrl: "https://github.com/mondaycom/mcp",
      tags: ["monday", "project-management", "productivity", "boards"],
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
      envKeys: ["STRIPE_SECRET_KEY"],
      homepageUrl: "https://docs.stripe.com/mcp",
      manifestUrl: "https://www.npmjs.com/package/@stripe/mcp",
      tags: ["stripe", "payments", "billing", "subscriptions", "commerce"],
    }
  ),
  http(
    "PayPal",
    "PayPal's official MCP server. Create and manage payments, invoices, subscriptions, and payouts.",
    "https://mcp.paypal.com",
    {
      homepageUrl: "https://developer.paypal.com",
      manifestUrl: "https://mcp.paypal.com",
      tags: ["paypal", "payments", "billing", "commerce"],
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
      envKeys: ["FIGMA_ACCESS_TOKEN"],
      homepageUrl: "https://www.figma.com",
      manifestUrl: "https://www.figma.com/developers/mcp",
      tags: ["figma", "design", "ui", "prototyping", "design-to-code"],
    }
  ),
  stdio(
    "Cloudinary",
    "Media upload, transformation, AI analysis, management, optimization, and delivery. Full asset lifecycle.",
    "cloudinary-mcp-server",
    [],
    {
      envKeys: ["CLOUDINARY_URL"],
      homepageUrl: "https://cloudinary.com",
      manifestUrl: "https://github.com/cloudinary/mcp-servers",
      tags: ["cloudinary", "media", "images", "video", "design"],
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
      envKeys: ["RESEND_API_KEY"],
      homepageUrl: "https://resend.com/docs/mcp-server",
      manifestUrl: "https://www.npmjs.com/package/resend-mcp",
      tags: ["resend", "email", "transactional", "communications"],
    }
  ),
];

// ===========================================================================
// Observability
// ===========================================================================

const observability: SeedMcp[] = [
  {
    args: ["mcp-grafana"],
    command: "uvx",
    description:
      "40+ tools across 15 categories: dashboard management, Prometheus, Loki logs, alerting, incident management, and OnCall.",
    envKeys: ["GRAFANA_URL", "GRAFANA_API_KEY"],
    homepageUrl: "https://grafana.com",
    manifestUrl: "https://github.com/grafana/mcp-grafana",
    name: "Grafana",
    tags: ["grafana", "observability", "monitoring", "prometheus", "loki"],
    transport: "stdio",
  },
  stdio(
    "PagerDuty",
    "Manage incidents, services, schedules, and escalation policies. Full PagerDuty account integration.",
    "pagerduty-mcp-server",
    [],
    {
      envKeys: ["PAGERDUTY_API_KEY"],
      homepageUrl: "https://pagerduty.com",
      manifestUrl: "https://github.com/PagerDuty/pagerduty-mcp-server",
      tags: ["pagerduty", "incidents", "on-call", "observability"],
    }
  ),
  stdio(
    "PostHog",
    "Interact with PostHog analytics, feature flags, experiments, error tracking, and session replay.",
    "posthog-mcp-server",
    [],
    {
      envKeys: ["POSTHOG_API_KEY"],
      homepageUrl: "https://posthog.com",
      manifestUrl: "https://github.com/posthog/mcp",
      tags: ["posthog", "analytics", "feature-flags", "observability"],
    }
  ),
  stdio(
    "Honeycomb",
    "Query and analyze observability data, alerts, dashboards, and cross-reference production behavior with code.",
    "honeycomb-mcp",
    [],
    {
      envKeys: ["HONEYCOMB_API_KEY"],
      homepageUrl: "https://honeycomb.io",
      manifestUrl: "https://github.com/honeycombio/honeycomb-mcp",
      tags: ["honeycomb", "observability", "tracing", "debugging"],
    }
  ),
  stdio(
    "Axiom",
    "Query and analyze Axiom logs, traces, and event data in natural language. Full observability pipeline.",
    "axiom-mcp-server",
    [],
    {
      envKeys: ["AXIOM_TOKEN"],
      homepageUrl: "https://axiom.co",
      manifestUrl: "https://github.com/axiomhq/mcp-server-axiom",
      tags: ["axiom", "observability", "logs", "traces"],
    }
  ),
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
      envKeys: ["OPENAI_API_KEY"],
      homepageUrl: "https://platform.openai.com",
      manifestUrl: "https://www.npmjs.com/package/@openai/mcp-server",
      tags: ["openai", "ai", "llm", "agents", "completions"],
    }
  ),
  http(
    "Hugging Face",
    "Connect to Hugging Face Hub: semantic search for spaces/papers, explore datasets and models, and access compatible tools.",
    "https://huggingface.co/mcp",
    {
      homepageUrl: "https://huggingface.co",
      manifestUrl: "https://huggingface.co/settings/mcp",
      tags: ["huggingface", "ai", "models", "datasets", "research"],
    }
  ),
  stdio(
    "E2B",
    "Run code in secure cloud sandboxes. Isolated execution environment for AI-generated code with full filesystem access.",
    "@e2b/mcp-server",
    [],
    {
      envKeys: ["E2B_API_KEY"],
      homepageUrl: "https://e2b.dev",
      manifestUrl: "https://github.com/e2b-dev/mcp-server",
      tags: ["e2b", "sandbox", "code-execution", "ai", "security"],
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
      envKeys: ["POSTGRES_CONNECTION_STRING"],
      homepageUrl: "https://github.com/modelcontextprotocol/servers",
      manifestUrl:
        "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres",
      tags: ["postgres", "database", "sql", "official"],
    }
  ),
  stdio(
    "SQLite",
    "Local SQLite database access with business intelligence capabilities. Query, analyze, and create memo tables.",
    "@modelcontextprotocol/server-sqlite",
    [],
    {
      homepageUrl: "https://github.com/modelcontextprotocol/servers",
      manifestUrl:
        "https://www.npmjs.com/package/@modelcontextprotocol/server-sqlite",
      tags: ["sqlite", "database", "sql", "local", "official"],
    }
  ),
];

// ===========================================================================
// Infrastructure & Cloud
// ===========================================================================

const infraCloud: SeedMcp[] = [
  uvx(
    "AWS API",
    "Official AWS Labs MCP server – interact with AWS services and resources through AWS CLI commands. Covers S3, Lambda, DynamoDB, EC2, CloudFormation, and all other AWS APIs.",
    "awslabs.aws-api-mcp-server",
    [],
    {
      envKeys: [
        "AWS_REGION",
        "AWS_PROFILE",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
      ],
      homepageUrl: "https://awslabs.github.io/mcp/servers/aws-api-mcp-server",
      manifestUrl: "https://github.com/awslabs/mcp",
      tags: ["aws", "cloud", "s3", "lambda", "infra", "official"],
    }
  ),
  stdio(
    "Azure",
    "Access Azure services: Azure Storage, Cosmos DB, Azure CLI, and more. Official Microsoft Azure MCP server.",
    "azure-mcp-server",
    [],
    {
      envKeys: ["AZURE_SUBSCRIPTION_ID"],
      homepageUrl: "https://azure.microsoft.com",
      manifestUrl:
        "https://github.com/microsoft/mcp/tree/main/servers/Azure.Mcp.Server",
      tags: ["azure", "cloud", "microsoft", "infra"],
    }
  ),
  stdio(
    "Google Cloud Run",
    "Deploy code to Google Cloud Run. Build, configure, and manage Cloud Run services and revisions.",
    "cloud-run-mcp",
    [],
    {
      envKeys: ["GOOGLE_CLOUD_PROJECT"],
      homepageUrl: "https://cloud.google.com/run",
      manifestUrl: "https://github.com/GoogleCloudPlatform/cloud-run-mcp",
      tags: ["gcp", "cloud", "cloud-run", "serverless", "infra"],
    }
  ),
  stdio(
    "Terraform",
    "Manage Terraform configurations, plan and apply infrastructure changes, and inspect state through MCP.",
    "terraform-mcp-server",
    [],
    {
      homepageUrl: "https://developer.hashicorp.com/terraform",
      manifestUrl: "https://www.npmjs.com/package/terraform-mcp-server",
      tags: ["terraform", "iac", "infrastructure", "devops"],
    }
  ),
  stdio(
    "Pulumi",
    "Deploy and manage cloud infrastructure using Pulumi. Create, update, and inspect stacks across any cloud.",
    "pulumi-mcp-server",
    [],
    {
      envKeys: ["PULUMI_ACCESS_TOKEN"],
      homepageUrl: "https://www.pulumi.com",
      manifestUrl: "https://github.com/pulumi/pulumi-mcp-server",
      tags: ["pulumi", "iac", "infrastructure", "devops"],
    }
  ),
  stdio(
    "Docker",
    "Manage Docker containers, images, volumes, and networks. Build, run, and inspect containerized applications.",
    "docker-mcp-server",
    [],
    {
      homepageUrl: "https://www.docker.com",
      manifestUrl: "https://www.npmjs.com/package/docker-mcp-server",
      tags: ["docker", "containers", "devops", "infrastructure"],
    }
  ),
  stdio(
    "Kubernetes",
    "Manage Kubernetes clusters, deployments, services, and pods. Apply manifests and inspect cluster state.",
    "kubernetes-mcp-server",
    [],
    {
      envKeys: ["KUBECONFIG"],
      homepageUrl: "https://kubernetes.io",
      manifestUrl: "https://www.npmjs.com/package/kubernetes-mcp-server",
      tags: ["kubernetes", "k8s", "containers", "orchestration", "infra"],
    }
  ),
  stdio(
    "Render",
    "Spin up new services, run queries against databases, and debug with direct access to service metrics and logs.",
    "render-mcp-server",
    [],
    {
      envKeys: ["RENDER_API_KEY"],
      homepageUrl: "https://render.com",
      manifestUrl: "https://render.com/docs/mcp-server",
      tags: ["render", "deployment", "hosting", "infra"],
    }
  ),
  stdio(
    "Firebase",
    "Firebase's experimental MCP server for managing Firebase projects, Firestore, Auth, and Cloud Functions.",
    "firebase-tools",
    ["mcp"],
    {
      homepageUrl: "https://firebase.google.com",
      manifestUrl:
        "https://github.com/firebase/firebase-tools/tree/main/src/mcp",
      tags: ["firebase", "google", "database", "auth", "infra"],
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
      envKeys: ["SNYK_TOKEN"],
      homepageUrl: "https://snyk.io",
      manifestUrl: "https://www.npmjs.com/package/snyk-mcp-server",
      tags: ["snyk", "security", "vulnerabilities", "dependencies", "sca"],
    }
  ),
  stdio(
    "Auth0",
    "Interact with your Auth0 tenant: manage actions, applications, forms, logs, resource servers, and more.",
    "@auth0/auth0-mcp-server",
    [],
    {
      envKeys: ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET"],
      homepageUrl: "https://auth0.com",
      manifestUrl: "https://github.com/auth0/auth0-mcp-server",
      tags: ["auth0", "auth", "identity", "security"],
    }
  ),
  stdio(
    "SonarQube",
    "Integration with SonarQube Server or Cloud for code quality analysis and vulnerability detection.",
    "sonarqube-mcp-server",
    [],
    {
      envKeys: ["SONARQUBE_URL", "SONARQUBE_TOKEN"],
      homepageUrl: "https://sonarsource.com",
      manifestUrl: "https://github.com/SonarSource/sonarqube-mcp-server",
      tags: ["sonarqube", "security", "code-quality", "static-analysis"],
    }
  ),
  stdio(
    "Semgrep",
    "Enable AI agents to secure code with Semgrep. Static analysis for finding bugs, vulnerabilities, and anti-patterns.",
    "semgrep",
    ["mcp"],
    {
      homepageUrl: "https://semgrep.dev",
      manifestUrl:
        "https://github.com/semgrep/semgrep/blob/develop/cli/src/semgrep/mcp/README.md",
      tags: ["semgrep", "security", "static-analysis", "code-quality"],
    }
  ),
  stdio(
    "CrowdStrike Falcon",
    "Intelligent security analysis: detections, incidents, threat intelligence, hosts, vulnerabilities, and identity protection.",
    "falcon-mcp",
    [],
    {
      envKeys: ["FALCON_CLIENT_ID", "FALCON_CLIENT_SECRET"],
      homepageUrl: "https://crowdstrike.com",
      manifestUrl: "https://github.com/CrowdStrike/falcon-mcp",
      tags: ["crowdstrike", "security", "threat-intelligence", "edr"],
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
      homepageUrl: "https://github.com/punkpeye/mcp-proxy",
      manifestUrl: "https://www.npmjs.com/package/mcp-proxy",
      tags: ["proxy", "transport", "http", "sse", "utility"],
    }
  ),
  stdio(
    "Time",
    "Time and timezone conversion utilities. Get current time in any timezone and convert between timezones.",
    "@modelcontextprotocol/server-time",
    [],
    {
      homepageUrl:
        "https://github.com/modelcontextprotocol/servers/tree/main/src/time",
      manifestUrl:
        "https://www.npmjs.com/package/@modelcontextprotocol/server-time",
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
  ...vectorDbs,
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
