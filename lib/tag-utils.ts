import type { CategorySlug } from "@/lib/types";

// ---------------------------------------------------------------------------
// Tag color system
// ---------------------------------------------------------------------------

export type TagColor =
  | "red"
  | "orange"
  | "amber"
  | "green"
  | "teal"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "neutral";

const CATEGORY_COLORS: Record<CategorySlug, TagColor> = {
  a2a: "purple",
  containers: "indigo",
  frontend: "orange",
  infra: "teal",
  ops: "amber",
  security: "red",
  "seo-geo": "blue",
  social: "pink",
};

const ORIGIN_COLORS: Record<string, TagColor> = {
  codex: "purple",
  imported: "green",
  remote: "green",
  repo: "teal",
  system: "neutral",
  user: "blue",
};

const STATUS_COLORS: Record<string, TagColor> = {
  active: "green",
  live: "green",
  paused: "neutral",
  seeded: "neutral",
  streaming: "blue",
};

const TRANSPORT_COLORS: Record<string, TagColor> = {
  http: "blue",
  sse: "teal",
  stdio: "indigo",
  streamable_http: "blue",
};

export function getTagColorForCategory(slug: CategorySlug): TagColor {
  return CATEGORY_COLORS[slug] ?? "neutral";
}

export function getTagColorForOrigin(origin: string): TagColor {
  return ORIGIN_COLORS[origin.toLowerCase()] ?? "neutral";
}

export function getTagColorForStatus(status: string): TagColor {
  return STATUS_COLORS[status.toLowerCase()] ?? "neutral";
}

export function getTagColorForTransport(transport: string): TagColor {
  return TRANSPORT_COLORS[transport.toLowerCase()] ?? "neutral";
}

// ---------------------------------------------------------------------------
// Tag CSS class map (pairs with globals.css --color-tag-* tokens)
// ---------------------------------------------------------------------------

export const TAG_COLOR_CLASSES: Record<TagColor, string> = {
  amber:
    "border-[var(--color-tag-amber)]/25 bg-[var(--color-tag-amber)]/[0.07] text-[var(--color-tag-amber)]",
  blue: "border-[var(--color-tag-blue)]/25 bg-[var(--color-tag-blue)]/[0.07] text-[var(--color-tag-blue)]",
  green:
    "border-[var(--color-tag-green)]/25 bg-[var(--color-tag-green)]/[0.07] text-[var(--color-tag-green)]",
  indigo:
    "border-[var(--color-tag-indigo)]/25 bg-[var(--color-tag-indigo)]/[0.07] text-[var(--color-tag-indigo)]",
  neutral: "border-line bg-paper-2 text-ink-faint",
  orange:
    "border-[var(--color-tag-orange)]/25 bg-[var(--color-tag-orange)]/[0.07] text-[var(--color-tag-orange)]",
  pink: "border-[var(--color-tag-pink)]/25 bg-[var(--color-tag-pink)]/[0.07] text-[var(--color-tag-pink)]",
  purple:
    "border-[var(--color-tag-purple)]/25 bg-[var(--color-tag-purple)]/[0.07] text-[var(--color-tag-purple)]",
  red: "border-[var(--color-tag-red)]/25 bg-[var(--color-tag-red)]/[0.07] text-[var(--color-tag-red)]",
  teal: "border-[var(--color-tag-teal)]/25 bg-[var(--color-tag-teal)]/[0.07] text-[var(--color-tag-teal)]",
};

// ---------------------------------------------------------------------------
// Smart tag label formatting
// ---------------------------------------------------------------------------

const ALWAYS_UPPER = new Set([
  "ai",
  "a2a",
  "ci",
  "cd",
  "ui",
  "ux",
  "api",
  "sdk",
  "seo",
  "geo",
  "aeo",
  "rss",
  "ssr",
  "ssg",
  "isr",
  "ppr",
  "css",
  "html",
  "svg",
  "jwt",
  "oci",
  "npm",
  "hn",
  "mcp",
  "llm",
  "llms",
  "pnpm",
  "sql",
  "http",
  "grpc",
  "dns",
  "tls",
  "oauth",
  "cors",
  "rbac",
  "xss",
  "csrf",
]);

const BRAND_CASING: Record<string, string> = {
  anthropic: "Anthropic",
  clerk: "Clerk",
  cloudflare: "Cloudflare",
  containerd: "containerd",
  docker: "Docker",
  github: "GitHub",
  google: "Google",
  graphql: "GraphQL",
  gsap: "GSAP",
  javascript: "JavaScript",
  kubernetes: "Kubernetes",
  linear: "Linear",
  lottie: "Lottie",
  mongodb: "MongoDB",
  "next.js": "Next.js",
  nextjs: "Next.js",
  openai: "OpenAI",
  pixijs: "PixiJS",
  podman: "Podman",
  portswigger: "PortSwigger",
  postgresql: "PostgreSQL",
  react: "React",
  redis: "Redis",
  "seo-geo": "SEO + GEO",
  stripe: "Stripe",
  supabase: "Supabase",
  threejs: "Three.js",
  turbopack: "Turbopack",
  turborepo: "Turborepo",
  typescript: "TypeScript",
  vercel: "Vercel",
  webgl: "WebGL",
  webgpu: "WebGPU",
  webpack: "webpack",
  webxr: "WebXR",
};

export function formatTagLabel(raw: string): string {
  const lower = raw.toLowerCase().trim();

  if (BRAND_CASING[lower]) {
    return BRAND_CASING[lower];
  }

  if (ALWAYS_UPPER.has(lower)) {
    return lower.toUpperCase();
  }

  return lower
    .split(/[-_]/)
    .map((word) => {
      if (ALWAYS_UPPER.has(word)) {
        return word.toUpperCase();
      }
      if (BRAND_CASING[word]) {
        return BRAND_CASING[word];
      }
      if (word.length <= 1) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
