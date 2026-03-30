import type { CategorySlug } from "@/lib/types";

// ---------------------------------------------------------------------------
// Icon types — supports both Lucide icon names and external logo URLs
// ---------------------------------------------------------------------------

export type IconRef =
  | { kind: "lucide"; name: string }
  | { kind: "url"; url: string; alt: string };

// ---------------------------------------------------------------------------
// Brand logo URLs — SimpleIcons CDN first, GitHub avatar fallback
// ---------------------------------------------------------------------------

const SI = "https://cdn.simpleicons.org";
const GH = "https://github.com";

const BRAND_LOGOS = {
  // SimpleIcons — default = official brand color
  anthropic:  `${SI}/anthropic`,
  auth0:      `${SI}/auth0`,
  brave:      `${SI}/brave`,
  clerk:      `${SI}/clerk`,
  cloudflare: `${SI}/cloudflare`,
  docker:     `${SI}/docker`,
  figma:      `${SI}/figma`,
  framer:     `${SI}/framer`,
  google:     `${SI}/google`,
  github:     `${SI}/github`,
  grafana:    `${SI}/grafana`,
  gsap:       `${SI}/greensock`,
  huggingface:`${SI}/huggingface`,
  kubernetes: `${SI}/kubernetes`,
  langchain:  `${SI}/langchain`,
  linear:     `${SI}/linear`,
  nextjs:     `${SI}/nextdotjs`,
  notion:     `${SI}/notion`,
  prisma:     `${SI}/prisma`,
  react:      `${SI}/react`,
  resend:     `${SI}/resend`,
  sentry:     `${SI}/sentry`,
  snyk:       `${SI}/snyk`,
  stripe:     `${SI}/stripe`,
  supabase:   `${SI}/supabase`,
  tailwind:   `${SI}/tailwindcss`,
  terraform:  `${SI}/terraform`,
  threejs:    `${SI}/threedotjs`,
  todoist:    `${SI}/todoist`,
  turso:      `${SI}/turso`,
  upstash:    `${SI}/upstash`,
  vercel:     `${SI}/vercel`,

  // Not on SimpleIcons — GitHub avatar fallback
  aws:        `${GH}/amazon.png?size=64`,
  context7:   `${GH}/upstash.png?size=64`,
  exa:        `${GH}/exa-labs.png?size=64`,
  firecrawl:  `${GH}/firecrawl.png?size=64`,
  moz:        `${GH}/moz.png?size=64`,
  neon:       `${GH}/neondatabase.png?size=64`,
  openai:     `${GH}/openai.png?size=64`,
  playwright: `${GH}/microsoft.png?size=64`,
  slack:      `${GH}/slack.png?size=64`,
} as const;

function lucide(name: string): IconRef {
  return { kind: "lucide", name };
}

function brand(key: keyof typeof BRAND_LOGOS, alt: string): IconRef {
  return { kind: "url", url: BRAND_LOGOS[key], alt };
}

// ---------------------------------------------------------------------------
// Category icons (Lucide icon names)
// ---------------------------------------------------------------------------

export const CATEGORY_ICONS: Record<CategorySlug, IconRef> = {
  frontend: lucide("palette"),
  "seo-geo": lucide("search"),
  social: lucide("megaphone"),
  infra: lucide("server"),
  containers: lucide("box"),
  a2a: lucide("brain"),
  security: lucide("shield"),
  ops: lucide("settings"),
};

// ---------------------------------------------------------------------------
// Skill icons — brand logos for provider-associated skills, Lucide for generic
// ---------------------------------------------------------------------------

const SKILL_ICONS: Record<string, IconRef> = {
  // Frontend
  "frontend-frontier": lucide("palette"),
  "motion-framer": brand("framer", "Motion"),
  "gsap-scrolltrigger": brand("gsap", "GSAP"),
  "react-three-fiber": brand("threejs", "Three.js"),
  "tailwind-design-system": brand("tailwind", "Tailwind CSS"),
  "web-performance": lucide("gauge"),
  "accessible-ui": lucide("accessibility"),
  "nextjs-patterns": brand("nextjs", "Next.js"),
  "responsive-layouts": lucide("monitor-smartphone"),
  "component-architecture": brand("react", "React"),

  // SEO + GEO
  "seo-geo": lucide("search"),
  "schema-markup": lucide("braces"),
  "technical-seo-audit": lucide("scan-search"),
  "ai-citability": brand("openai", "OpenAI"),
  "keyword-research": lucide("text-search"),
  "content-seo-strategy": lucide("file-text"),

  // Social
  "social-content-os": lucide("megaphone"),
  "social-draft": lucide("pen-line"),
  "audience-growth": lucide("trending-up"),
  "content-repurposing": lucide("repeat-2"),
  "newsletter-craft": lucide("mail"),

  // Infra
  "edge-compute": brand("cloudflare", "Cloudflare"),
  "database-patterns": brand("supabase", "Supabase"),
  "observability-stack": lucide("activity"),
  "serverless-architecture": brand("vercel", "Vercel"),
  "cdn-caching": lucide("hard-drive"),

  // Containers
  "dockerfile-mastery": brand("docker", "Docker"),
  "kubernetes-essentials": brand("kubernetes", "Kubernetes"),
  "container-security": lucide("shield-check"),

  // A2A — Agents
  "agent-orchestration": lucide("brain"),
  "mcp-development": brand("anthropic", "Anthropic"),
  "prompt-engineering": brand("openai", "OpenAI"),
  "tool-use-patterns": lucide("wrench"),
  "rag-pipelines": lucide("database"),

  // Security
  "security-best-practices": lucide("shield"),
  "security-threat-model": lucide("shield-alert"),
  "auth-patterns": brand("clerk", "Clerk"),
  "api-security": lucide("lock"),

  // Ops
  "gh-actions-ci": brand("github", "GitHub"),
  "release-management": lucide("git-branch"),
};

export function getSkillIcon(slug: string): IconRef {
  return SKILL_ICONS[slug] ?? lucide("file-text");
}

export function getCategoryIcon(slug: CategorySlug): IconRef {
  return CATEGORY_ICONS[slug] ?? lucide("folder");
}

// ---------------------------------------------------------------------------
// MCP icons — brand logos for imported MCP servers, keyed by name
// ---------------------------------------------------------------------------

const MCP_ICONS: Record<string, IconRef> = {
  // Official reference
  "Filesystem": lucide("folder-open"),
  "Memory": lucide("brain"),
  "Sequential Thinking": lucide("list-ordered"),
  "Fetch": lucide("globe"),
  "Git": lucide("git-branch"),

  // Dev platforms
  "GitHub": brand("github", "GitHub"),
  "Vercel": brand("vercel", "Vercel"),
  "Cloudflare": brand("cloudflare", "Cloudflare"),
  "Sentry": brand("sentry", "Sentry"),

  // Databases
  "Supabase": brand("supabase", "Supabase"),
  "Neon": brand("neon", "Neon"),
  "Prisma": brand("prisma", "Prisma"),
  "Turso": brand("turso", "Turso"),
  "Upstash": brand("upstash", "Upstash"),

  // Search & research
  "Context7": brand("context7", "Context7"),
  "Brave Search": brand("brave", "Brave"),
  "Exa": brand("exa", "Exa"),
  "Firecrawl": brand("firecrawl", "Firecrawl"),

  // Browser
  "Playwright": brand("playwright", "Playwright"),
  "Puppeteer": brand("google", "Puppeteer"),

  // Productivity
  "Notion": brand("notion", "Notion"),
  "Slack": brand("slack", "Slack"),
  "Linear": brand("linear", "Linear"),
  "Todoist": brand("todoist", "Todoist"),

  // Payments
  "Stripe": brand("stripe", "Stripe"),

  // Design
  "Figma": brand("figma", "Figma"),

  // Email
  "Resend": brand("resend", "Resend"),

  // Observability
  "Grafana": brand("grafana", "Grafana"),

  // AI
  "OpenAI Agents": brand("openai", "OpenAI"),

  // Data
  "PostgreSQL": lucide("database"),
  "SQLite": lucide("database"),

  // Infra
  "AWS": brand("aws", "AWS"),
  "Terraform": brand("terraform", "Terraform"),
  "Docker": brand("docker", "Docker"),
  "Kubernetes": brand("kubernetes", "Kubernetes"),

  // Security
  "Snyk": brand("snyk", "Snyk"),

  // Utilities
  "MCP Proxy": lucide("arrow-right-left"),
  "Time": lucide("clock"),
};

export function getMcpIcon(name: string, homepageUrl?: string): IconRef {
  const match = MCP_ICONS[name];
  if (match) return match;
  if (homepageUrl) {
    return { kind: "url", url: computeSourceLogoUrl(homepageUrl), alt: name };
  }
  return lucide("plug");
}

// ---------------------------------------------------------------------------
// Source logo computation — precompute from URL hostname via Google favicons
// ---------------------------------------------------------------------------

export function computeSourceLogoUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return "";
  }
}
