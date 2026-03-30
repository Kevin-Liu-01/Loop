import { computeSourceLogoUrl } from "@/lib/skill-icons";
import type { SkillAutomationState, SourceDefinition } from "@/lib/types";

// ---------------------------------------------------------------------------
// Shared source pools — reuse across skills to avoid duplication
// ---------------------------------------------------------------------------

const SRC = {
  // --- AI / LLM providers ---
  openaiNews: src("openai-news", "OpenAI News", "https://openai.com/news/rss.xml", "rss", ["openai", "llm", "agents"]),
  openaiChangelog: src("openai-changelog", "OpenAI Platform Changelog", "https://platform.openai.com/docs/changelog", "docs", ["openai", "api", "changelog"]),
  anthropicNews: src("anthropic-news", "Anthropic News", "https://www.anthropic.com/news", "docs", ["anthropic", "claude", "llm"]),
  anthropicDocs: src("anthropic-docs", "Anthropic Docs", "https://docs.anthropic.com/en/docs/about-claude/models", "docs", ["anthropic", "models", "api"]),
  googleAi: src("google-ai-blog", "Google AI Blog", "https://blog.google/technology/ai/rss/", "rss", ["google", "gemini", "ai"]),
  googleDevAi: src("google-dev-ai", "Google AI Dev", "https://ai.google.dev/", "docs", ["google", "gemini", "sdk"]),
  metaAi: src("meta-ai-blog", "Meta AI Blog", "https://ai.meta.com/blog/", "docs", ["meta", "llama", "ai"]),
  vercelAiSdk: src("vercel-ai-sdk", "Vercel AI SDK Releases", "https://github.com/vercel/ai/releases.atom", "atom", ["vercel", "ai-sdk", "agents"]),
  langchainBlog: src("langchain-blog", "LangChain Blog", "https://blog.langchain.dev/feed/", "rss", ["langchain", "agents", "rag"]),
  huggingFace: src("huggingface-blog", "Hugging Face Blog", "https://huggingface.co/blog/feed.xml", "rss", ["huggingface", "models", "ml"]),

  // --- Frontend ---
  vercelBlog: src("vercel-blog", "Vercel Blog", "https://vercel.com/atom", "atom", ["vercel", "next.js", "frontend"]),
  reactBlog: src("react-blog", "React Blog", "https://react.dev/rss.xml", "rss", ["react", "frontend"]),
  nextjsReleases: src("nextjs-releases", "Next.js Releases", "https://github.com/vercel/next.js/releases.atom", "atom", ["next.js", "releases"]),
  chromeDevBlog: src("chrome-dev", "Chrome Developer Blog", "https://developer.chrome.com/blog/feed.xml", "rss", ["chrome", "web-platform"]),
  webDev: src("web-dev", "web.dev", "https://web.dev/feed.xml", "rss", ["web-platform", "performance", "pwa"]),
  cssWg: src("css-wg-drafts", "CSS Drafts", "https://github.com/w3c/csswg-drafts/releases.atom", "atom", ["css", "standards"]),
  smashingMag: src("smashing-magazine", "Smashing Magazine", "https://www.smashingmagazine.com/feed/", "rss", ["frontend", "design", "ux"]),
  motionReleases: src("motion-releases", "Motion Releases", "https://github.com/motiondivision/motion/releases.atom", "atom", ["motion", "animation"]),
  gsapForum: src("gsap-forum", "GSAP Community", "https://gsap.com/community/", "docs", ["gsap", "animation"]),
  threejsReleases: src("threejs-releases", "Three.js Releases", "https://github.com/mrdoob/three.js/releases.atom", "atom", ["threejs", "3d", "webgl"]),
  tailwindBlog: src("tailwind-blog", "Tailwind CSS Blog", "https://tailwindcss.com/blog", "docs", ["tailwind", "css"]),
  tailwindReleases: src("tailwind-releases", "Tailwind Releases", "https://github.com/tailwindlabs/tailwindcss/releases.atom", "atom", ["tailwind", "releases"]),

  // --- SEO / GEO ---
  mozBlog: src("moz-blog", "Moz Blog", "https://moz.com/blog/feed", "rss", ["seo", "industry"]),
  searchEngineLand: src("search-engine-land", "Search Engine Land", "https://searchengineland.com/feed", "rss", ["seo", "industry"]),
  googleSearchCentral: src("google-search-central", "Google Search Central", "https://developers.google.com/search/blog", "docs", ["google", "search"]),
  ahrefsBlog: src("ahrefs-blog", "Ahrefs Blog", "https://ahrefs.com/blog/feed/", "rss", ["seo", "backlinks", "research"]),
  sej: src("search-engine-journal", "Search Engine Journal", "https://www.searchenginejournal.com/feed/", "rss", ["seo", "geo"]),
  schemaOrg: src("schema-org", "Schema.org Releases", "https://github.com/schemaorg/schemaorg/releases.atom", "atom", ["schema", "structured-data"]),

  // --- Infra ---
  cloudflareBlog: src("cloudflare-blog", "Cloudflare Blog", "https://blog.cloudflare.com/rss/", "rss", ["cloudflare", "edge"]),
  kubernetesBlog: src("kubernetes-blog", "Kubernetes Blog", "https://kubernetes.io/feed.xml", "rss", ["kubernetes", "infra"]),
  supabaseBlog: src("supabase-blog", "Supabase Blog", "https://supabase.com/blog/rss.xml", "rss", ["supabase", "postgres", "database"]),
  postgresWeekly: src("postgres-weekly", "Postgres Weekly", "https://postgresweekly.com/rss/", "rss", ["postgres", "database"]),
  denoReleases: src("deno-releases", "Deno Releases", "https://github.com/denoland/deno/releases.atom", "atom", ["deno", "runtime"]),
  neonBlog: src("neon-blog", "Neon Blog", "https://neon.tech/blog/rss.xml", "rss", ["neon", "postgres", "serverless"]),

  // --- Containers ---
  dockerBlog: src("docker-blog", "Docker Blog", "https://www.docker.com/blog/feed/", "rss", ["docker", "containers"]),
  containerdReleases: src("containerd-releases", "containerd Releases", "https://github.com/containerd/containerd/releases.atom", "atom", ["containerd", "runtime"]),
  trivyReleases: src("trivy-releases", "Trivy Releases", "https://github.com/aquasecurity/trivy/releases.atom", "atom", ["trivy", "security", "scanning"]),

  // --- Security ---
  githubAdvisory: src("github-advisory", "GitHub Security Advisories", "https://github.com/advisories?query=type%3Areviewed+ecosystem%3Anpm", "docs", ["security", "npm"]),
  portswigger: src("portswigger-research", "PortSwigger Research", "https://portswigger.net/research/rss", "rss", ["security", "research"]),
  krebsSecurity: src("krebs-security", "Krebs on Security", "https://krebsonsecurity.com/feed/", "rss", ["security", "industry"]),
  snykBlog: src("snyk-blog", "Snyk Blog", "https://snyk.io/blog/feed/", "rss", ["security", "vulnerabilities"]),
  owaspBlog: src("owasp-blog", "OWASP", "https://owasp.org/feed.xml", "rss", ["owasp", "appsec"]),
  clerkChangelog: src("clerk-changelog", "Clerk Changelog", "https://clerk.com/changelog", "docs", ["clerk", "auth"]),

  // --- Ops ---
  githubBlog: src("github-blog", "GitHub Blog", "https://github.blog/feed/", "rss", ["github", "ops"]),
  githubChangelog: src("github-changelog", "GitHub Changelog", "https://github.blog/changelog/feed/", "rss", ["github", "changelog"]),
  linearChangelog: src("linear-changelog", "Linear Changelog", "https://linear.app/changelog", "docs", ["linear", "ops"]),

  // --- Social / Content ---
  hnFrontpage: src("hn-frontpage", "Hacker News", "https://hnrss.org/frontpage", "rss", ["hn", "tech"]),
  productHunt: src("product-hunt", "Product Hunt", "https://www.producthunt.com/feed", "rss", ["launches", "products"]),
  indiehackers: src("indiehackers", "Indie Hackers", "https://www.indiehackers.com/feed.xml", "rss", ["growth", "building"]),

  // --- Performance / Web Platform ---
  lighthouseReleases: src("lighthouse-releases", "Lighthouse Releases", "https://github.com/GoogleChrome/lighthouse/releases.atom", "atom", ["lighthouse", "performance"]),
  v8Blog: src("v8-blog", "V8 Blog", "https://v8.dev/blog.atom", "atom", ["v8", "javascript", "performance"]),

  // --- A11y ---
  a11yProject: src("a11y-project", "The A11Y Project", "https://www.a11yproject.com/feed/feed.xml", "rss", ["accessibility", "a11y"]),
  wcagUpdates: src("wcag-updates", "W3C WAI", "https://www.w3.org/WAI/feed.xml", "rss", ["wcag", "standards"]),

  // --- MCP / Protocol ---
  mcpSpec: src("mcp-spec", "MCP Spec Releases", "https://github.com/modelcontextprotocol/specification/releases.atom", "atom", ["mcp", "protocol"]),
  mcpServers: src("mcp-servers", "MCP Servers Repo", "https://github.com/modelcontextprotocol/servers/releases.atom", "atom", ["mcp", "servers"]),
} as const;

// ---------------------------------------------------------------------------
// Per-skill source assignments
// ---------------------------------------------------------------------------

export type SkillSourceConfig = {
  slug: string;
  sources: SourceDefinition[];
  automation: SkillAutomationState;
};

export const SKILL_SOURCE_CONFIGS: SkillSourceConfig[] = [
  // =========================================================================
  // FRONTEND (10)
  // =========================================================================
  config("frontend-frontier", "daily",
    "Refresh Frontend Frontier from tracked sources. Focus on new art direction references, motion library updates, design-system tooling, and frontier stack changes.",
    [SRC.vercelBlog, SRC.chromeDevBlog, SRC.smashingMag, SRC.tailwindBlog, SRC.motionReleases, SRC.threejsReleases]),

  config("motion-framer", "daily",
    "Refresh Motion (Framer Motion) skill. Track new API features, migration guides, performance improvements, and community patterns.",
    [SRC.motionReleases, SRC.vercelBlog, SRC.reactBlog, SRC.chromeDevBlog]),

  config("gsap-scrolltrigger", "weekly",
    "Refresh GSAP + ScrollTrigger skill. Focus on new plugin features, scroll-driven animation patterns, and browser API changes that affect scroll behavior.",
    [SRC.gsapForum, SRC.chromeDevBlog, SRC.webDev, SRC.smashingMag]),

  config("react-three-fiber", "weekly",
    "Refresh React Three Fiber skill. Track Three.js core updates, drei additions, R3F ecosystem changes, and WebGPU progress.",
    [SRC.threejsReleases, SRC.reactBlog, SRC.chromeDevBlog]),

  config("tailwind-design-system", "daily",
    "Refresh Tailwind Design System skill. Track Tailwind CSS releases, @theme API changes, and design token patterns.",
    [SRC.tailwindBlog, SRC.tailwindReleases, SRC.chromeDevBlog, SRC.cssWg]),

  config("web-performance", "daily",
    "Refresh Web Performance skill. Track Core Web Vitals changes, Lighthouse updates, browser engine optimizations, and new performance APIs.",
    [SRC.webDev, SRC.chromeDevBlog, SRC.lighthouseReleases, SRC.v8Blog, SRC.vercelBlog]),

  config("accessible-ui", "weekly",
    "Refresh Accessible UI skill. Track WCAG updates, ARIA pattern changes, browser accessibility improvements, and community resources.",
    [SRC.a11yProject, SRC.wcagUpdates, SRC.chromeDevBlog, SRC.webDev]),

  config("nextjs-patterns", "daily",
    "Refresh Next.js Patterns skill. Track Next.js releases, Vercel platform changes, React Server Component patterns, and caching strategy updates.",
    [SRC.nextjsReleases, SRC.vercelBlog, SRC.reactBlog, SRC.chromeDevBlog]),

  config("responsive-layouts", "weekly",
    "Refresh Responsive Layouts skill. Track container query support, new CSS features, viewport unit changes, and responsive design patterns.",
    [SRC.cssWg, SRC.chromeDevBlog, SRC.webDev, SRC.smashingMag]),

  config("component-architecture", "weekly",
    "Refresh Component Architecture skill. Track React patterns, composition techniques, state management trends, and ecosystem tooling changes.",
    [SRC.reactBlog, SRC.vercelBlog, SRC.hnFrontpage]),

  // =========================================================================
  // SEO + GEO (6)
  // =========================================================================
  config("seo-geo", "daily",
    "Refresh SEO + GEO skill. Track Google algorithm changes, AI search platform updates, entity coverage patterns, schema.org changes, and crawler behavior shifts.",
    [SRC.googleSearchCentral, SRC.mozBlog, SRC.searchEngineLand, SRC.ahrefsBlog, SRC.sej, SRC.openaiNews]),

  config("schema-markup", "weekly",
    "Refresh Schema Markup skill. Track schema.org releases, Google rich result changes, structured data validation updates, and new schema types.",
    [SRC.schemaOrg, SRC.googleSearchCentral, SRC.mozBlog, SRC.searchEngineLand]),

  config("technical-seo-audit", "weekly",
    "Refresh Technical SEO Audit skill. Track crawlability changes, indexing behavior, Core Web Vitals thresholds, and site infrastructure best practices.",
    [SRC.googleSearchCentral, SRC.webDev, SRC.chromeDevBlog, SRC.mozBlog, SRC.ahrefsBlog]),

  config("ai-citability", "daily",
    "Refresh AI Citability & GEO skill. Track AI search platform changes from OpenAI, Google, Perplexity, and Anthropic. Focus on citation behavior, grounding patterns, and llms.txt adoption.",
    [SRC.openaiNews, SRC.anthropicNews, SRC.googleAi, SRC.googleSearchCentral, SRC.searchEngineLand, SRC.sej]),

  config("keyword-research", "weekly",
    "Refresh Keyword Research skill. Track search intent changes, keyword tool updates, and competitor analysis methodology.",
    [SRC.mozBlog, SRC.ahrefsBlog, SRC.searchEngineLand, SRC.sej]),

  config("content-seo-strategy", "weekly",
    "Refresh Content SEO Strategy skill. Track content marketing trends, topic cluster methodology, internal linking best practices, and content refresh strategies.",
    [SRC.mozBlog, SRC.ahrefsBlog, SRC.searchEngineLand, SRC.smashingMag]),

  // =========================================================================
  // SOCIAL (5)
  // =========================================================================
  config("social-content-os", "weekly",
    "Refresh Social Content OS skill. Track platform algorithm changes, content strategy trends, and distribution patterns that affect technical audiences.",
    [SRC.hnFrontpage, SRC.productHunt, SRC.indiehackers]),

  config("social-draft", "weekly",
    "Refresh Social Draft skill. Track platform format changes, hook patterns, and engagement mechanics for X and LinkedIn.",
    [SRC.hnFrontpage, SRC.productHunt]),

  config("audience-growth", "weekly",
    "Refresh Audience Growth skill. Track platform algorithm changes, follower growth mechanics, and engagement optimization patterns.",
    [SRC.hnFrontpage, SRC.productHunt, SRC.indiehackers]),

  config("content-repurposing", "weekly",
    "Refresh Content Repurposing skill. Track multi-format content trends, platform-specific format changes, and distribution channel effectiveness.",
    [SRC.hnFrontpage, SRC.productHunt]),

  config("newsletter-craft", "weekly",
    "Refresh Newsletter Craft skill. Track email deliverability changes, subject line trends, newsletter platform features, and growth tactics.",
    [SRC.hnFrontpage, SRC.indiehackers, SRC.productHunt]),

  // =========================================================================
  // INFRA (5)
  // =========================================================================
  config("edge-compute", "daily",
    "Refresh Edge Compute skill. Track Cloudflare Workers updates, Vercel Edge Function changes, Deno Deploy features, and edge runtime API evolution.",
    [SRC.cloudflareBlog, SRC.vercelBlog, SRC.denoReleases, SRC.chromeDevBlog]),

  config("database-patterns", "daily",
    "Refresh Database Patterns skill. Track Postgres releases, Supabase features, connection pooling changes, and query optimization techniques.",
    [SRC.supabaseBlog, SRC.postgresWeekly, SRC.neonBlog, SRC.vercelBlog]),

  config("observability-stack", "weekly",
    "Refresh Observability Stack skill. Track logging, tracing, and alerting tool updates, OpenTelemetry changes, and best practices for structured observability.",
    [SRC.cloudflareBlog, SRC.vercelBlog, SRC.githubBlog, SRC.hnFrontpage]),

  config("serverless-architecture", "daily",
    "Refresh Serverless Architecture skill. Track serverless platform changes, cold start improvements, edge function updates, and event-driven patterns.",
    [SRC.vercelBlog, SRC.cloudflareBlog, SRC.supabaseBlog, SRC.denoReleases]),

  config("cdn-caching", "weekly",
    "Refresh CDN & Caching skill. Track CDN provider updates, Cache-Control best practices, ISR changes, and cache invalidation patterns.",
    [SRC.cloudflareBlog, SRC.vercelBlog, SRC.webDev, SRC.chromeDevBlog]),

  // =========================================================================
  // CONTAINERS (3)
  // =========================================================================
  config("dockerfile-mastery", "weekly",
    "Refresh Dockerfile Mastery skill. Track Docker releases, multi-stage build improvements, security hardening patterns, and image optimization techniques.",
    [SRC.dockerBlog, SRC.containerdReleases, SRC.trivyReleases, SRC.githubBlog]),

  config("kubernetes-essentials", "weekly",
    "Refresh Kubernetes Essentials skill. Track Kubernetes releases, new resource types, security policies, and deployment pattern changes.",
    [SRC.kubernetesBlog, SRC.dockerBlog, SRC.containerdReleases, SRC.githubBlog]),

  config("container-security", "daily",
    "Refresh Container Security skill. Track CVEs, image scanning tool updates, runtime security policies, and supply chain security patterns.",
    [SRC.trivyReleases, SRC.snykBlog, SRC.dockerBlog, SRC.githubAdvisory, SRC.containerdReleases]),

  // =========================================================================
  // A2A — AGENTS (5)
  // =========================================================================
  config("agent-orchestration", "daily",
    "Refresh Agent Orchestration skill. Track multi-agent patterns from OpenAI, Anthropic, Google, and LangChain. Focus on handoff protocols, state management, and orchestration architecture changes.",
    [SRC.openaiNews, SRC.openaiChangelog, SRC.anthropicNews, SRC.anthropicDocs, SRC.googleAi, SRC.vercelAiSdk, SRC.langchainBlog, SRC.huggingFace]),

  config("mcp-development", "daily",
    "Refresh MCP Development skill. Track MCP spec changes, new server implementations, transport protocol updates, and tool definition patterns.",
    [SRC.mcpSpec, SRC.mcpServers, SRC.anthropicNews, SRC.openaiNews, SRC.vercelAiSdk]),

  config("prompt-engineering", "daily",
    "Refresh Prompt Engineering skill. Track new prompting techniques from OpenAI, Anthropic, and Google. Focus on structured output, chain-of-thought, and production prompt patterns.",
    [SRC.openaiNews, SRC.openaiChangelog, SRC.anthropicNews, SRC.anthropicDocs, SRC.googleAi, SRC.googleDevAi, SRC.huggingFace]),

  config("tool-use-patterns", "daily",
    "Refresh Tool Use Patterns skill. Track function calling API changes, structured output evolution, and tool composition patterns across major LLM providers.",
    [SRC.openaiNews, SRC.openaiChangelog, SRC.anthropicNews, SRC.anthropicDocs, SRC.googleDevAi, SRC.vercelAiSdk, SRC.langchainBlog]),

  config("rag-pipelines", "daily",
    "Refresh RAG Pipelines skill. Track embedding model releases, vector database updates, retrieval technique improvements, and evaluation methodology changes.",
    [SRC.openaiNews, SRC.openaiChangelog, SRC.anthropicNews, SRC.huggingFace, SRC.langchainBlog, SRC.supabaseBlog, SRC.neonBlog]),

  // =========================================================================
  // SECURITY (4)
  // =========================================================================
  config("security-best-practices", "daily",
    "Refresh Security Best Practices skill. Track CVEs, dependency vulnerabilities, secure coding pattern updates, and web security advisories.",
    [SRC.githubAdvisory, SRC.snykBlog, SRC.portswigger, SRC.owaspBlog, SRC.krebsSecurity]),

  config("security-threat-model", "weekly",
    "Refresh Security Threat Model skill. Track threat modeling methodology updates, STRIDE/DREAD pattern evolution, and application security trends.",
    [SRC.owaspBlog, SRC.portswigger, SRC.snykBlog, SRC.krebsSecurity]),

  config("auth-patterns", "daily",
    "Refresh Auth Patterns skill. Track auth provider changes from Clerk, JWT/session security updates, OAuth spec evolution, and RLS patterns.",
    [SRC.clerkChangelog, SRC.owaspBlog, SRC.supabaseBlog, SRC.portswigger, SRC.snykBlog]),

  config("api-security", "daily",
    "Refresh API Security skill. Track rate limiting best practices, CORS changes, webhook security patterns, and API vulnerability disclosures.",
    [SRC.portswigger, SRC.snykBlog, SRC.owaspBlog, SRC.githubAdvisory, SRC.vercelBlog]),

  // =========================================================================
  // OPS (2)
  // =========================================================================
  config("gh-actions-ci", "daily",
    "Refresh GitHub Actions CI skill. Track GitHub Actions runner updates, new action releases, caching improvements, and CI/CD best practices.",
    [SRC.githubBlog, SRC.githubChangelog, SRC.vercelBlog]),

  config("release-management", "weekly",
    "Refresh Release Management skill. Track versioning tool updates, changelog automation, feature flag tooling, and deployment strategy patterns.",
    [SRC.githubBlog, SRC.githubChangelog, SRC.vercelBlog, SRC.linearChangelog]),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function src(
  id: string,
  label: string,
  url: string,
  kind: SourceDefinition["kind"],
  tags: string[]
): SourceDefinition {
  return { id, label, url, kind, tags, logoUrl: computeSourceLogoUrl(url) };
}

function config(
  slug: string,
  cadence: SkillAutomationState["cadence"],
  prompt: string,
  sources: SourceDefinition[]
): SkillSourceConfig {
  return {
    slug,
    sources,
    automation: {
      enabled: true,
      cadence,
      status: "active",
      prompt
    }
  };
}
