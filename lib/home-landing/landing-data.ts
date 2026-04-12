/**
 * Landing page data – sourced from the real skill registry, MCP catalog, and
 * automation configs so visitors see actual platform content.
 */

import { githubAvatar } from "@/lib/brand-icons";
import type { AutomationSummary, ImportedMcpDocument } from "@/lib/types";

export interface LandingSkillRow {
  slug: string;
  title: string;
  category: string;
  versionLabel: string;
  tone: "fresh" | "stale" | "idle";
  updatedAt: string;
  description: string;
  iconUrl?: string;
  ownerName: string;
}

// ---------------------------------------------------------------------------
// Top skills – mirrors FEATURED_SKILLS from registry.ts + SKILL_SOURCE_CONFIGS
// ---------------------------------------------------------------------------

export const LANDING_SKILLS: LandingSkillRow[] = [
  {
    category: "frontend",
    description:
      "Art-direction, design-system tokens, motion, and 3D patterns for modern frontends.",
    ownerName: "Loop",
    slug: "frontend-frontier",
    title: "Frontend Frontier",
    tone: "fresh",
    updatedAt: "18 min ago",
    versionLabel: "v7",
  },
  {
    category: "a2a",
    description:
      "Multi-agent protocol patterns, handoff APIs, and state-management architecture for orchestration.",
    ownerName: "Loop",
    slug: "agent-orchestration",
    title: "Agent Orchestration",
    tone: "fresh",
    updatedAt: "42 min ago",
    versionLabel: "v5",
  },
  {
    category: "seo-geo",
    description:
      "Search visibility, entity coverage, structured data, and AI-citability guidance.",
    ownerName: "Loop",
    slug: "seo-geo",
    title: "SEO + GEO",
    tone: "fresh",
    updatedAt: "1h ago",
    versionLabel: "v6",
  },
  {
    category: "security",
    description:
      "Secure-coding checklist, dependency-audit workflow, and incident-response patterns.",
    ownerName: "Loop",
    slug: "security-best-practices",
    title: "Security Best Practices",
    tone: "fresh",
    updatedAt: "2h ago",
    versionLabel: "v4",
  },
  {
    category: "frontend",
    description:
      "App Router, cache directives, proxy.ts, Turbopack defaults, and SSR/ISR/PPR strategies.",
    ownerName: "Loop",
    slug: "nextjs-patterns",
    title: "Next.js Patterns",
    tone: "fresh",
    updatedAt: "3h ago",
    versionLabel: "v8",
  },
  {
    category: "infra",
    description:
      "Postgres extensions, RLS patterns, connection-pooling, and schema-design guidance for Supabase & Neon.",
    ownerName: "Loop",
    slug: "database-patterns",
    title: "Database Patterns",
    tone: "stale",
    updatedAt: "1d ago",
    versionLabel: "v3",
  },
  {
    category: "a2a",
    description:
      "Chain-of-thought templates, few-shot examples, and production prompt-versioning patterns.",
    ownerName: "Loop",
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    tone: "fresh",
    updatedAt: "55 min ago",
    versionLabel: "v6",
  },
  {
    category: "ops",
    description:
      "Actions runner updates, caching-API changes, secret management, and workflow templates.",
    ownerName: "Loop",
    slug: "gh-actions-ci",
    title: "GitHub Actions CI",
    tone: "idle",
    updatedAt: "3d ago",
    versionLabel: "v3",
  },
];

// ---------------------------------------------------------------------------
// Automations – real schedules from SKILL_SOURCE_CONFIGS automation cadences
// Uses actual RRULE format consumed by the AutomationCalendar
// ---------------------------------------------------------------------------

export const LANDING_AUTOMATIONS: AutomationSummary[] = [
  {
    cadence: "daily",
    cwd: [],
    id: "auto-frontend-frontier",
    matchedCategorySlugs: ["frontend"],
    matchedSkillSlugs: ["frontend-frontier"],
    name: "Frontend Frontier refresh",
    path: "/automations/frontend-frontier",
    preferredHour: 9,
    prompt:
      "Scrape tracked sources for new art-direction references, motion-library API changes, design-system tooling releases, and frontier CSS/JS features.",
    schedule: "Daily · 9:05 AM",
    status: "ACTIVE",
  },
  {
    cadence: "daily",
    cwd: [],
    id: "auto-agent-orchestration",
    matchedCategorySlugs: ["a2a"],
    matchedSkillSlugs: ["agent-orchestration"],
    name: "Agent Orchestration scan",
    path: "/automations/agent-orchestration",
    preferredHour: 9,
    prompt:
      "Scan OpenAI, Anthropic, and Google blogs for multi-agent protocol changes, handoff-API updates, and orchestration pattern guidance.",
    schedule: "Daily · 9:05 AM",
    status: "ACTIVE",
  },
  {
    cadence: "daily",
    cwd: [],
    id: "auto-seo-geo",
    matchedCategorySlugs: ["seo-geo"],
    matchedSkillSlugs: ["seo-geo"],
    name: "SEO + GEO audit",
    path: "/automations/seo-geo",
    preferredHour: 9,
    prompt:
      "Scan Google Search Central for algorithm updates, indexing policy changes, and rich-result requirements. Track schema.org releases.",
    schedule: "Daily · 9:05 AM",
    status: "ACTIVE",
  },
  {
    cadence: "daily",
    cwd: [],
    id: "auto-security",
    matchedCategorySlugs: ["security"],
    matchedSkillSlugs: ["security-best-practices"],
    name: "Security advisory sweep",
    path: "/automations/security-best-practices",
    preferredHour: 9,
    prompt:
      "Scan GitHub Security Advisories for critical npm CVEs. Check Snyk blog for dependency vulnerability trends. Monitor PortSwigger for new web-attack techniques.",
    schedule: "Daily · 9:05 AM",
    status: "ACTIVE",
  },
  {
    cadence: "daily",
    cwd: [],
    id: "auto-nextjs",
    matchedCategorySlugs: ["frontend"],
    matchedSkillSlugs: ["nextjs-patterns"],
    name: "Next.js Patterns refresh",
    path: "/automations/nextjs-patterns",
    preferredHour: 9,
    prompt:
      "Check Next.js releases for App Router changes, new cache directives, proxy.ts updates, and Turbopack defaults.",
    schedule: "Daily · 9:05 AM",
    status: "ACTIVE",
  },
  {
    cadence: "daily",
    cwd: [],
    id: "auto-prompt-engineering",
    matchedCategorySlugs: ["a2a"],
    matchedSkillSlugs: ["prompt-engineering"],
    name: "Prompt Engineering update",
    path: "/automations/prompt-engineering",
    preferredHour: 9,
    prompt:
      "Scan OpenAI and Anthropic changelogs for model behavior changes that affect prompting. Update chain-of-thought templates and few-shot examples.",
    schedule: "Daily · 9:05 AM",
    status: "ACTIVE",
  },
  {
    cadence: "daily",
    cwd: [],
    id: "auto-database",
    matchedCategorySlugs: ["infra"],
    matchedSkillSlugs: ["database-patterns"],
    name: "Database Patterns refresh",
    path: "/automations/database-patterns",
    preferredHour: 9,
    prompt:
      "Check Supabase blog for new Postgres extensions, RLS pattern updates, and connection-pooling changes. Scan Neon blog for serverless Postgres features.",
    schedule: "Daily · 9:05 AM",
    status: "ACTIVE",
  },
  {
    cadence: "daily",
    cwd: [],
    id: "auto-gh-actions",
    matchedCategorySlugs: ["ops"],
    matchedSkillSlugs: ["gh-actions-ci"],
    name: "GitHub Actions CI refresh",
    path: "/automations/gh-actions-ci",
    preferredHour: 9,
    prompt:
      "Check GitHub Blog and Changelog for Actions runner updates, new built-in actions, caching-API changes, and OIDC token improvements.",
    schedule: "Daily · 9:05 AM",
    status: "ACTIVE",
  },
];

// ---------------------------------------------------------------------------
// Top MCPs – from SEED_MCP_DEFINITIONS (real catalog entries)
// ---------------------------------------------------------------------------

export type LandingMcpRow = Pick<
  ImportedMcpDocument,
  "id" | "name" | "description" | "transport" | "iconUrl" | "homepageUrl"
>;

export const LANDING_MCPS: LandingMcpRow[] = [
  {
    description:
      "Search repos, manage issues and PRs, read files, create branches, and review Actions runs",
    homepageUrl: "https://github.com/github/github-mcp-server",
    iconUrl: githubAvatar("github"),
    id: "mcp-github",
    name: "GitHub",
    transport: "stdio",
  },
  {
    description: "Manage deployments, domains, environment variables, and logs",
    homepageUrl: "https://vercel.com/docs/mcp",
    iconUrl: githubAvatar("vercel"),
    id: "mcp-vercel",
    name: "Vercel",
    transport: "http",
  },
  {
    description:
      "Query databases, manage auth, inspect schemas, and deploy edge functions",
    homepageUrl: "https://github.com/supabase-community/supabase-mcp",
    iconUrl: githubAvatar("supabase"),
    id: "mcp-supabase",
    name: "Supabase",
    transport: "stdio",
  },
  {
    description:
      "Payments, subscriptions, customers, and invoices via the Stripe API",
    homepageUrl: "https://docs.stripe.com/mcp",
    iconUrl: githubAvatar("stripe"),
    id: "mcp-stripe",
    name: "Stripe",
    transport: "http",
  },
  {
    description:
      "Search messages, users, channels, and files. Send messages and manage canvases",
    homepageUrl: "https://api.slack.com",
    iconUrl: githubAvatar("slackapi"),
    id: "mcp-slack",
    name: "Slack",
    transport: "http",
  },
  {
    description:
      "Create and update issues, manage projects and cycles, and search docs",
    homepageUrl: "https://linear.app/docs/mcp",
    iconUrl: githubAvatar("linearapp"),
    id: "mcp-linear",
    name: "Linear",
    transport: "http",
  },
  {
    description:
      "Extract design context, generate code from frames, and write to the canvas",
    homepageUrl: "https://www.figma.com/developers/mcp",
    iconUrl: githubAvatar("figma"),
    id: "mcp-figma",
    name: "Figma",
    transport: "http",
  },
  {
    description:
      "Create pages, query databases, search workspace, and manage content",
    homepageUrl: "https://developers.notion.com",
    iconUrl: githubAvatar("makenotion"),
    id: "mcp-notion",
    name: "Notion",
    transport: "http",
  },
  {
    description:
      "Access issues, errors, projects, and AI-powered Seer analysis for debugging",
    homepageUrl: "https://docs.sentry.io/ai/mcp/",
    iconUrl: githubAvatar("getsentry"),
    id: "mcp-sentry",
    name: "Sentry",
    transport: "stdio",
  },
  {
    description:
      "Browser automation using accessibility snapshots – navigate, fill forms, screenshot",
    homepageUrl: "https://github.com/microsoft/playwright-mcp",
    iconUrl: githubAvatar("microsoft"),
    id: "mcp-playwright",
    name: "Playwright",
    transport: "stdio",
  },
];
