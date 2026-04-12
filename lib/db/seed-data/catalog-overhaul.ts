import { resolveBrandIcon, githubAvatar } from "@/lib/brand-icons";
import type {
  McpAuthType,
  McpInstallStrategy,
  McpVerificationStatus,
  SkillUpstreamRecord,
  TrustedSkillSourceRecord,
} from "@/lib/types";

type TrustedSkillSourceSeed = TrustedSkillSourceRecord;

type LocalUpstreamSeed = Omit<SkillUpstreamRecord, "body" | "logoUrl"> & {
  matchPathSuffix: string;
};

interface McpNormalizationOverride {
  docsUrl?: string;
  authType?: McpAuthType;
  installStrategy?: McpInstallStrategy;
  verificationStatus?: McpVerificationStatus;
  sandboxSupported?: boolean;
  sandboxNotes?: string;
}

export const TRUSTED_SKILL_SOURCE_SEEDS: TrustedSkillSourceSeed[] = [
  {
    discoveryMode: "discover",
    homepageUrl: "https://github.com/openai/skills",
    id: "openai-skills",
    logoUrl: resolveBrandIcon("openai")!,
    name: "OpenAI Skills",
    repoUrl: "https://github.com/openai/skills",
    searchQueries: ["openai skills github", "codex skills official"],
    slug: "openai-skills",
    sourceType: "official-repo",
    tags: ["skills", "official", "codex"],
    trustTier: "official",
  },
  {
    discoveryMode: "discover",
    homepageUrl: "https://github.com/anthropics/skills",
    id: "anthropic-skills",
    logoUrl: resolveBrandIcon("anthropic")!,
    name: "Anthropic Skills",
    repoUrl: "https://github.com/anthropics/skills",
    searchQueries: ["anthropic skills github", "claude skills official"],
    slug: "anthropic-skills",
    sourceType: "official-repo",
    tags: ["skills", "official", "claude"],
    trustTier: "official",
  },
  {
    discoveryMode: "discover",
    homepageUrl: "https://platform.openai.com/docs",
    id: "openai-docs",
    logoUrl: resolveBrandIcon("openai")!,
    name: "OpenAI Docs",
    searchQueries: [
      "openai responses api",
      "openai tool calling",
      "openai structured outputs",
    ],
    slug: "openai-docs",
    sourceType: "official-docs",
    tags: ["docs", "api", "openai"],
    trustTier: "official",
  },
  {
    discoveryMode: "discover",
    homepageUrl: "https://vercel.com/docs",
    id: "vercel-docs",
    logoUrl: resolveBrandIcon("vercel")!,
    name: "Vercel Docs",
    searchQueries: ["vercel ai sdk", "vercel workflow", "vercel observability"],
    slug: "vercel-docs",
    sourceType: "vendor-docs",
    tags: ["docs", "vercel", "platform"],
    trustTier: "official",
  },
  {
    discoveryMode: "discover",
    homepageUrl: "https://nextjs.org/docs",
    id: "nextjs-docs",
    logoUrl: resolveBrandIcon("nextjs")!,
    name: "Next.js Docs",
    searchQueries: [
      "nextjs app router",
      "nextjs caching",
      "nextjs server actions",
    ],
    slug: "nextjs-docs",
    sourceType: "vendor-docs",
    tags: ["docs", "nextjs", "frontend"],
    trustTier: "official",
  },
  {
    discoveryMode: "discover",
    homepageUrl: "https://react.dev",
    id: "react-docs",
    logoUrl: resolveBrandIcon("react")!,
    name: "React Docs",
    searchQueries: ["react compiler", "react hooks", "react server components"],
    slug: "react-docs",
    sourceType: "official-docs",
    tags: ["docs", "react", "frontend"],
    trustTier: "official",
  },
  {
    discoveryMode: "discover",
    homepageUrl: "https://github.com/modelcontextprotocol",
    id: "modelcontextprotocol",
    logoUrl: githubAvatar("modelcontextprotocol"),
    name: "Model Context Protocol",
    repoUrl: "https://github.com/modelcontextprotocol",
    searchQueries: ["mcp specification", "mcp registry", "mcp server auth"],
    slug: "modelcontextprotocol",
    sourceType: "official-repo",
    tags: ["mcp", "protocol", "registry"],
    trustTier: "standards",
  },
  {
    discoveryMode: "discover",
    homepageUrl: "https://owasp.org",
    id: "owasp",
    logoUrl: resolveBrandIcon("owasp")!,
    name: "OWASP",
    searchQueries: [
      "owasp threat modeling",
      "owasp secure coding",
      "owasp api security",
    ],
    slug: "owasp",
    sourceType: "official-docs",
    tags: ["security", "standards", "appsec"],
    trustTier: "standards",
  },
  {
    discoveryMode: "discover",
    homepageUrl: "https://supabase.com/docs",
    id: "supabase-docs",
    logoUrl: resolveBrandIcon("supabase")!,
    name: "Supabase Docs",
    searchQueries: [
      "supabase rls",
      "supabase pgvector",
      "supabase edge functions",
    ],
    slug: "supabase-docs",
    sourceType: "vendor-docs",
    tags: ["database", "supabase", "docs"],
    trustTier: "vendor",
  },
  {
    discoveryMode: "discover",
    homepageUrl: "https://developers.cloudflare.com",
    id: "cloudflare-docs",
    logoUrl: resolveBrandIcon("cloudflare")!,
    name: "Cloudflare Docs",
    searchQueries: [
      "cloudflare workers",
      "durable objects",
      "cloudflare queues",
    ],
    slug: "cloudflare-docs",
    sourceType: "vendor-docs",
    tags: ["cloudflare", "edge", "docs"],
    trustTier: "vendor",
  },
];

export const LOCAL_UPSTREAM_SKILLS: LocalUpstreamSeed[] = [
  {
    category: "frontend",
    description:
      "High-signal UI art direction, motion, and distinct frontend execution.",
    matchPathSuffix: "/skills/frontend-frontier/SKILL.md",
    slug: "frontend-frontier",
    sourceId: "openai-skills",
    tags: ["frontend", "art-direction", "motion"],
    title: "Frontend Frontier",
    upstreamKind: "skill",
    upstreamUrl:
      "https://github.com/openai/skills/tree/main/skills/frontend-frontier",
  },
  {
    category: "frontend",
    description:
      "Production React animation guidance for variants, gestures, layout, and presence.",
    matchPathSuffix: "/skills/motion-framer/SKILL.md",
    slug: "motion-framer",
    sourceId: "openai-skills",
    tags: ["frontend", "animation", "react"],
    title: "Motion",
    upstreamKind: "skill",
    upstreamUrl:
      "https://github.com/openai/skills/tree/main/skills/motion-framer",
  },
  {
    category: "frontend",
    description:
      "Scroll choreography, pinning, scrubbing, and multi-surface animation systems.",
    matchPathSuffix: "/skills/gsap-scrolltrigger/SKILL.md",
    slug: "gsap-scrolltrigger",
    sourceId: "openai-skills",
    tags: ["frontend", "animation", "scroll"],
    title: "GSAP + ScrollTrigger",
    upstreamKind: "skill",
    upstreamUrl:
      "https://github.com/openai/skills/tree/main/skills/gsap-scrolltrigger",
  },
  {
    category: "frontend",
    description:
      "Declarative 3D scenes in React using R3F and the Three.js ecosystem.",
    matchPathSuffix: "/skills/react-three-fiber/SKILL.md",
    slug: "react-three-fiber",
    sourceId: "openai-skills",
    tags: ["frontend", "3d", "react"],
    title: "React Three Fiber",
    upstreamKind: "skill",
    upstreamUrl:
      "https://github.com/openai/skills/tree/main/skills/react-three-fiber",
  },
  {
    category: "security",
    description:
      "Language-aware secure coding review with actionable best-practice fixes.",
    matchPathSuffix: "/skills/security-best-practices/SKILL.md",
    slug: "security-best-practices",
    sourceId: "openai-skills",
    tags: ["security", "secure-coding", "review"],
    title: "Security Best Practices",
    upstreamKind: "skill",
    upstreamUrl:
      "https://github.com/openai/skills/tree/main/skills/security-best-practices",
  },
  {
    category: "security",
    description:
      "Repository-grounded threat modeling with abuse paths, trust boundaries, and mitigations.",
    matchPathSuffix: "/skills/security-threat-model/SKILL.md",
    slug: "security-threat-model",
    sourceId: "openai-skills",
    tags: ["security", "threat-modeling", "architecture"],
    title: "Security Threat Model",
    upstreamKind: "skill",
    upstreamUrl:
      "https://github.com/openai/skills/tree/main/skills/security-threat-model",
  },
  {
    category: "a2a",
    description:
      "Official OpenAI docs workflow for model selection, API changes, and canonical guidance.",
    matchPathSuffix: "/skills/.system/openai-docs/SKILL.md",
    slug: "openai-docs",
    sourceId: "openai-docs",
    tags: ["openai", "docs", "api"],
    title: "OpenAI Docs",
    upstreamKind: "docs-pack",
    upstreamUrl: "https://platform.openai.com/docs",
  },
  {
    category: "a2a",
    description:
      "Official AI SDK skill for chat, structured output, tool calling, agents, and streaming.",
    matchPathSuffix: "/skills/ai-sdk/SKILL.md",
    slug: "vercel-ai-sdk",
    sourceId: "vercel-docs",
    tags: ["vercel", "ai-sdk", "agents"],
    title: "Vercel AI SDK",
    upstreamKind: "plugin-skill",
    upstreamUrl: "https://vercel.com/docs/ai",
  },
  {
    category: "a2a",
    description:
      "Routing, failover, and multi-provider model access through a unified gateway.",
    matchPathSuffix: "/skills/ai-gateway/SKILL.md",
    slug: "vercel-ai-gateway",
    sourceId: "vercel-docs",
    tags: ["vercel", "gateway", "providers"],
    title: "Vercel AI Gateway",
    upstreamKind: "plugin-skill",
    upstreamUrl: "https://vercel.com/docs/ai-gateway",
  },
  {
    category: "frontend",
    description:
      "Official Next.js App Router patterns spanning routing, rendering, caching, and server actions.",
    matchPathSuffix: "/skills/nextjs/SKILL.md",
    slug: "vercel-nextjs",
    sourceId: "nextjs-docs",
    tags: ["nextjs", "app-router", "frontend"],
    title: "Next.js",
    upstreamKind: "plugin-skill",
    upstreamUrl: "https://nextjs.org/docs",
  },
  {
    category: "infra",
    description:
      "Logs, traces, analytics, and performance instrumentation for production systems.",
    matchPathSuffix: "/skills/observability/SKILL.md",
    slug: "vercel-observability",
    sourceId: "vercel-docs",
    tags: ["observability", "logging", "tracing"],
    title: "Vercel Observability",
    upstreamKind: "plugin-skill",
    upstreamUrl: "https://vercel.com/docs/observability",
  },
  {
    category: "a2a",
    description:
      "Durable workflow orchestration for long-running tasks, retries, and step execution.",
    matchPathSuffix: "/skills/workflow/SKILL.md",
    slug: "vercel-workflow",
    sourceId: "vercel-docs",
    tags: ["workflow", "agents", "durable-execution"],
    title: "Vercel Workflow",
    upstreamKind: "plugin-skill",
    upstreamUrl: "https://vercel.com/docs/workflow",
  },
  {
    category: "ops",
    description:
      "Live platform access for deployments, env vars, docs, and operational tooling.",
    matchPathSuffix: "/skills/vercel-api/SKILL.md",
    slug: "vercel-api",
    sourceId: "vercel-docs",
    tags: ["vercel", "mcp", "operations"],
    title: "Vercel API",
    upstreamKind: "plugin-skill",
    upstreamUrl: "https://vercel.com/docs/mcp",
  },
  {
    category: "ops",
    description:
      "Diagnose failing GitHub PR checks and repair CI with logs-first workflow.",
    matchPathSuffix: "/skills/gh-fix-ci/SKILL.md",
    slug: "gh-fix-ci",
    sourceId: "openai-skills",
    tags: ["github", "ci", "ops"],
    title: "GitHub CI Fix",
    upstreamKind: "skill",
    upstreamUrl: "https://github.com/openai/skills/tree/main/skills/gh-fix-ci",
  },
];

export const SKILL_UPSTREAM_LINKS: Record<string, string[]> = {
  "agent-orchestration": ["vercel-workflow", "vercel-ai-sdk", "openai-docs"],
  "frontend-frontier": ["frontend-frontier"],
  "gh-actions-ci": ["gh-fix-ci"],
  "gsap-scrolltrigger": ["gsap-scrolltrigger"],
  "mcp-development": ["vercel-api", "openai-docs"],
  "motion-framer": ["motion-framer"],
  "nextjs-patterns": ["vercel-nextjs", "frontend-frontier"],
  "observability-stack": ["vercel-observability"],
  "prompt-engineering": ["openai-docs"],
  "rag-pipelines": ["openai-docs", "vercel-ai-sdk"],
  "react-three-fiber": ["react-three-fiber"],
  "security-best-practices": ["security-best-practices"],
  "security-threat-model": ["security-threat-model"],
  "serverless-architecture": ["vercel-workflow", "vercel-api"],
  "tool-use-patterns": ["openai-docs", "vercel-ai-sdk"],
};

export const DIRECT_TRANSPLANT_SKILLS: Record<string, string> = {
  "frontend-frontier": "frontend-frontier",
  "gsap-scrolltrigger": "gsap-scrolltrigger",
  "motion-framer": "motion-framer",
  "nextjs-patterns": "vercel-nextjs",
  "observability-stack": "vercel-observability",
  "react-three-fiber": "react-three-fiber",
  "security-best-practices": "security-best-practices",
  "security-threat-model": "security-threat-model",
};

export const FEATURED_SKILL_ORDER = [
  "frontend-frontier",
  "nextjs-patterns",
  "agent-orchestration",
  "motion-framer",
  "database-patterns",
  "tool-use-patterns",
  "mcp-development",
  "security-best-practices",
  "web-performance",
  "observability-stack",
  "seo-geo",
  "rag-pipelines",
];

export const FEATURED_REASON_OVERRIDES: Partial<Record<string, string>> = {
  "agent-orchestration":
    "Crosses tooling, architecture, and automation. This is the category people keep tripping over in production.",
  "frontend-frontier":
    "Broadest appeal, strong upstream corpus, and directly useful for anyone shipping UI in anger.",
  "mcp-development":
    "Directly tied to MCP adoption and a current source of real product pain, so surfacing it is not optional.",
  "nextjs-patterns":
    "High demand surface area, official upstream docs, and immediate leverage for the app-router-heavy crowd.",
  "security-best-practices":
    "High-trust, high-stakes guidance with immediate value across almost every repo.",
};

export const QUALITY_SCORE_OVERRIDES: Partial<Record<string, number>> = {
  "agent-orchestration": 95,
  "frontend-frontier": 98,
  "mcp-development": 94,
  "nextjs-patterns": 96,
  "observability-stack": 92,
  "security-best-practices": 94,
  "tool-use-patterns": 95,
};

export const MCP_NORMALIZATION_OVERRIDES: Record<
  string,
  McpNormalizationOverride
> = {
  "Brave Search": {
    authType: "api-key",
    sandboxNotes: "Search MCP with straightforward API-key auth.",
    sandboxSupported: true,
    verificationStatus: "partial",
  },
  Exa: {
    authType: "api-key",
    sandboxNotes: "Great research MCP, but only after EXA_API_KEY is wired.",
    sandboxSupported: true,
    verificationStatus: "partial",
  },
  Fetch: {
    authType: "none",
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    installStrategy: "npx",
    sandboxNotes:
      "Reliable default web fetcher for public URLs and markdown conversion.",
    sandboxSupported: true,
    verificationStatus: "verified",
  },
  Figma: {
    authType: "session",
    docsUrl: "https://www.figma.com/developers/mcp",
    sandboxNotes:
      "Useful for design-to-code flows when the connected Figma session is present on the app server.",
    sandboxSupported: true,
    verificationStatus: "verified",
  },
  Filesystem: {
    authType: "none",
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    installStrategy: "npx",
    sandboxNotes:
      "Runs locally via npx inside the Loop runtime and needs no external credentials.",
    sandboxSupported: true,
    verificationStatus: "verified",
  },
  Firecrawl: {
    authType: "api-key",
    sandboxNotes:
      "Useful for structured site extraction when FIRECRAWL_API_KEY is configured.",
    sandboxSupported: true,
    verificationStatus: "partial",
  },
  Git: {
    authType: "none",
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
    installStrategy: "npx",
    sandboxNotes:
      "Works against local repositories without external auth when the repo is mounted.",
    sandboxSupported: true,
    verificationStatus: "verified",
  },
  GitHub: {
    authType: "pat",
    docsUrl: "https://github.com/github/github-mcp-server",
    installStrategy: "npx",
    sandboxNotes:
      "Requires GITHUB_PERSONAL_ACCESS_TOKEN with the right scopes, then behaves consistently in the sandbox.",
    sandboxSupported: true,
    verificationStatus: "verified",
  },
  Linear: {
    authType: "api-key",
    docsUrl: "https://linear.app/docs",
    installStrategy: "remote-http",
    sandboxNotes: "High-value sandbox MCP when LINEAR_API_KEY is configured.",
    sandboxSupported: true,
    verificationStatus: "verified",
  },
  Memory: {
    authType: "none",
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    installStrategy: "npx",
    sandboxNotes: "Safe default MCP for persistent scratch memory across runs.",
    sandboxSupported: true,
    verificationStatus: "verified",
  },
  Notion: {
    authType: "api-key",
    sandboxNotes:
      "Usable once NOTION_API_KEY is present. Keep it visible but clearly credential-gated.",
    sandboxSupported: true,
    verificationStatus: "partial",
  },
  Playwright: {
    authType: "none",
    docsUrl: "https://playwright.dev/docs",
    sandboxNotes:
      "Excellent default browser MCP for sandbox runs and visual verification.",
    sandboxSupported: true,
    verificationStatus: "verified",
  },
  Sentry: {
    authType: "api-key",
    sandboxNotes:
      "Useful for production debugging when SENTRY_AUTH_TOKEN is available.",
    sandboxSupported: true,
    verificationStatus: "partial",
  },
  "Sequential Thinking": {
    authType: "none",
    docsUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
    installStrategy: "npx",
    sandboxNotes:
      "Useful when the agent needs explicit decomposition instead of silent chain-of-thought mush.",
    sandboxSupported: true,
    verificationStatus: "verified",
  },
  Slack: {
    authType: "api-key",
    sandboxNotes:
      "Credential-gated. Hide from default demos unless Slack auth is configured.",
    sandboxSupported: true,
    verificationStatus: "partial",
  },
  Supabase: {
    authType: "api-key",
    sandboxNotes:
      "Powerful, but only once project URL and service credentials are configured correctly.",
    sandboxSupported: true,
    verificationStatus: "partial",
  },
  Vercel: {
    authType: "session",
    docsUrl: "https://vercel.com/docs/mcp",
    installStrategy: "remote-http",
    sandboxNotes:
      "Remote MCP endpoint. Works when the app server has valid Vercel auth context.",
    sandboxSupported: true,
    verificationStatus: "verified",
  },
};
