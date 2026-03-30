import type { CategorySlug } from "@/lib/types";

// ---------------------------------------------------------------------------
// Icon types — supports both Lucide icon names and external logo URLs
// ---------------------------------------------------------------------------

export type IconRef =
  | { kind: "lucide"; name: string }
  | { kind: "url"; url: string; alt: string };

// ---------------------------------------------------------------------------
// Brand logo URLs (high-quality favicons and CDN logos)
// ---------------------------------------------------------------------------

const BRAND_LOGOS = {
  openai: "https://cdn.openai.com/API/logo-assets/openai-logomark.png",
  anthropic: "https://www.anthropic.com/favicon.ico",
  google: "https://www.google.com/s2/favicons?domain=ai.google.dev&sz=64",
  vercel: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
  react: "https://www.google.com/s2/favicons?domain=react.dev&sz=64",
  nextjs: "https://www.google.com/s2/favicons?domain=nextjs.org&sz=64",
  tailwind: "https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=64",
  threejs: "https://www.google.com/s2/favicons?domain=threejs.org&sz=64",
  docker: "https://www.google.com/s2/favicons?domain=docker.com&sz=64",
  kubernetes: "https://www.google.com/s2/favicons?domain=kubernetes.io&sz=64",
  github: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
  supabase: "https://www.google.com/s2/favicons?domain=supabase.com&sz=64",
  cloudflare: "https://www.google.com/s2/favicons?domain=cloudflare.com&sz=64",
  moz: "https://www.google.com/s2/favicons?domain=moz.com&sz=64",
  clerk: "https://www.google.com/s2/favicons?domain=clerk.com&sz=64",
  sentry: "https://www.google.com/s2/favicons?domain=sentry.io&sz=64",
  linear: "https://www.google.com/s2/favicons?domain=linear.app&sz=64",
  gsap: "https://www.google.com/s2/favicons?domain=gsap.com&sz=64",
  framer: "https://www.google.com/s2/favicons?domain=motion.dev&sz=64",
  langchain: "https://www.google.com/s2/favicons?domain=langchain.dev&sz=64",
  huggingface: "https://www.google.com/s2/favicons?domain=huggingface.co&sz=64",
  playwright: "https://www.google.com/s2/favicons?domain=playwright.dev&sz=64",
  figma: "https://www.google.com/s2/favicons?domain=figma.com&sz=64",
  notion: "https://www.google.com/s2/favicons?domain=notion.so&sz=64",
  slack: "https://www.google.com/s2/favicons?domain=slack.com&sz=64",
  stripe: "https://www.google.com/s2/favicons?domain=stripe.com&sz=64",
  neon: "https://www.google.com/s2/favicons?domain=neon.tech&sz=64",
  prisma: "https://www.google.com/s2/favicons?domain=prisma.io&sz=64",
  turso: "https://www.google.com/s2/favicons?domain=turso.tech&sz=64",
  upstash: "https://www.google.com/s2/favicons?domain=upstash.com&sz=64",
  brave: "https://www.google.com/s2/favicons?domain=brave.com&sz=64",
  exa: "https://www.google.com/s2/favicons?domain=exa.ai&sz=64",
  firecrawl: "https://www.google.com/s2/favicons?domain=firecrawl.dev&sz=64",
  resend: "https://www.google.com/s2/favicons?domain=resend.com&sz=64",
  grafana: "https://www.google.com/s2/favicons?domain=grafana.com&sz=64",
  snyk: "https://www.google.com/s2/favicons?domain=snyk.io&sz=64",
  terraform: "https://www.google.com/s2/favicons?domain=terraform.io&sz=64",
  aws: "https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=64",
  todoist: "https://www.google.com/s2/favicons?domain=todoist.com&sz=64",
  context7: "https://www.google.com/s2/favicons?domain=context7.com&sz=64",
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
