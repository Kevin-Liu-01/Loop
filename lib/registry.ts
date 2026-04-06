import type { CategoryDefinition, CategorySlug, MembershipPlan, SourceMode, SourceTrustTier, SourceParser } from "@/lib/types";
import { computeSourceLogoUrl } from "@/lib/skill-icons";

type SourceMeta = {
  mode?: SourceMode;
  trust?: SourceTrustTier;
  parser?: SourceParser;
  searchQueries?: string[];
};

function s(
  id: string,
  label: string,
  url: string,
  kind: "rss" | "atom" | "docs",
  tags: string[],
  meta?: SourceMeta
) {
  return { id, label, url, kind, tags, logoUrl: computeSourceLogoUrl(url), ...meta } as const;
}

export const CATEGORY_REGISTRY: CategoryDefinition[] = [
  {
    slug: "frontend",
    title: "Frontend",
    strapline: "Design engineering, motion, and signal-rich UI systems.",
    description:
      "Editorial UI craft, motion systems, design-engineering references, and production-ready frontend skills.",
    hero: "Daily frontend radar with local skills, source pulls, and reusable agent prompts.",
    accent: "signal-red",
    icon: "palette",
    status: "live",
    keywords: ["frontend", "motion", "design", "react", "next.js", "ui", "animation"],
    sources: [
      s("vercel-blog", "Vercel Blog", "https://vercel.com/atom", "atom", ["vercel", "next.js", "frontend"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["next.js", "vercel", "edge", "turbopack"] }),
      s("react-blog", "React Blog", "https://react.dev/rss.xml", "rss", ["react", "frontend"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["react", "compiler", "server components", "suspense"] }),
      s("nextjs-releases", "Next.js Releases", "https://github.com/vercel/next.js/releases.atom", "atom", ["next.js", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["next.js", "app router", "turbopack"] }),
      s("web-dev-blog", "web.dev", "https://web.dev/blog/feed.xml", "rss", ["chrome", "web-platform", "performance"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["core web vitals", "performance", "css", "web platform"] }),
      s("chrome-devrel", "Chrome DevRel", "https://developer.chrome.com/static/blog/feed.xml", "rss", ["chrome", "devtools", "web-platform"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["devtools", "chrome", "css", "api"] }),
      s("smashing-magazine", "Smashing Magazine", "https://www.smashingmagazine.com/feed/", "rss", ["frontend", "css", "ux"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["css", "accessibility", "design systems", "animation"] }),
      s("webkit-blog", "WebKit Blog", "https://webkit.org/feed/", "rss", ["webkit", "safari", "web-platform"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["webkit", "safari", "css", "web api"] }),
      s("frontend-masters", "Frontend Masters Blog", "https://frontendmasters.com/blog/feed/", "rss", ["frontend", "tutorials"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["frontend", "react", "typescript", "css"] }),
      s("typescript-releases", "TypeScript Releases", "https://github.com/microsoft/TypeScript/releases.atom", "atom", ["typescript", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["typescript", "type system"] }),
      s("tailwind-releases", "Tailwind CSS Releases", "https://github.com/tailwindlabs/tailwindcss/releases.atom", "atom", ["tailwind", "css", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["tailwind", "css", "utility"] }),
      s("motion-releases", "Motion Releases", "https://github.com/motiondivision/motion/releases.atom", "atom", ["motion", "animation", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["motion", "framer", "animation"] })
    ]
  },
  {
    slug: "seo-geo",
    title: "SEO + GEO",
    strapline: "Search visibility, entity coverage, and AI citability.",
    description:
      "Living operational guidance for search, generative-engine optimization, structured data, and source quality.",
    hero: "Track crawler, citation, and entity-surface shifts without drowning in acronym soup.",
    accent: "signal-blue",
    icon: "search",
    status: "live",
    keywords: ["seo", "geo", "aeo", "search", "schema", "crawler", "citability"],
    sources: [
      s("google-search-central", "Google Search Central", "https://developers.google.com/search/blog", "docs", ["google", "search", "crawlers"], { mode: "discover", trust: "official", parser: "html-links", searchQueries: ["search console", "crawling", "indexing", "structured data", "core update"] }),
      s("moz-blog", "Moz Blog", "https://moz.com/blog/feed", "rss", ["seo", "link-building", "research"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["seo", "domain authority", "link building", "serp"] }),
      s("search-engine-land", "Search Engine Land", "https://searchengineland.com/feed", "rss", ["seo", "sem", "industry"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["google update", "seo", "ppc", "search algorithm"] }),
      s("search-engine-journal", "Search Engine Journal", "https://www.searchenginejournal.com/feed/", "rss", ["seo", "tutorials", "news"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["seo strategy", "content optimization", "technical seo"] }),
      s("ahrefs-blog", "Ahrefs Blog", "https://ahrefs.com/blog/feed/", "rss", ["seo", "keywords", "backlinks"], { mode: "discover", trust: "vendor", parser: "feed", searchQueries: ["backlinks", "keyword research", "site audit", "rank tracking"] }),
      s("semrush-blog", "Semrush Blog", "https://www.semrush.com/blog/feed/", "rss", ["seo", "content-strategy", "sem"], { mode: "discover", trust: "vendor", parser: "feed", searchQueries: ["competitive analysis", "content marketing", "seo audit"] }),
      s("yoast-blog", "Yoast Blog", "https://yoast.com/feed/", "rss", ["seo", "wordpress", "technical-seo"], { mode: "discover", trust: "vendor", parser: "feed", searchQueries: ["schema markup", "readability", "technical seo", "wordpress"] }),
      s("schema-org-releases", "Schema.org Releases", "https://github.com/schemaorg/schemaorg/releases.atom", "atom", ["schema", "structured-data", "releases"], { mode: "track", trust: "standards", parser: "feed", searchQueries: ["schema.org", "structured data", "json-ld"] }),
      s("google-ai-blog", "Google AI Blog", "https://blog.google/technology/ai/rss/", "rss", ["google", "ai-search", "geo"], { mode: "discover", trust: "official", parser: "feed", searchQueries: ["ai overview", "gemini", "search generative", "geo"] }),
      s("bing-webmaster", "Bing Webmaster Blog", "https://blogs.bing.com/webmaster/feed", "rss", ["bing", "search", "crawlers"], { mode: "discover", trust: "official", parser: "feed", searchQueries: ["bing", "indexnow", "crawler", "webmaster"] })
    ]
  },
  {
    slug: "social",
    title: "Social Systems",
    strapline: "Post operating systems, drafts, and proof-backed publishing loops.",
    description:
      "Turn signals into ranked content backlogs, sharper drafts, and repeatable publishing systems.",
    hero: "The content side of the machine: what to say, how to say it, and why anyone should care.",
    accent: "signal-gold",
    icon: "megaphone",
    status: "live",
    keywords: ["social", "content", "linkedin", "x", "post", "distribution"],
    sources: [
      s("social-media-examiner", "Social Media Examiner", "https://www.socialmediaexaminer.com/feed/", "rss", ["social", "strategy", "ads"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["social media strategy", "algorithm", "engagement", "ads"] }),
      s("buffer-blog", "Buffer Blog", "https://buffer.com/resources/feed/", "rss", ["social", "scheduling", "analytics"], { mode: "discover", trust: "vendor", parser: "feed", searchQueries: ["scheduling", "analytics", "social publishing"] }),
      s("copyblogger", "Copyblogger", "https://copyblogger.com/feed/", "rss", ["copywriting", "content-marketing"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["copywriting", "headlines", "persuasion", "content"] }),
      s("hubspot-marketing", "HubSpot Marketing", "https://blog.hubspot.com/marketing/rss.xml", "rss", ["inbound", "marketing", "seo"], { mode: "discover", trust: "vendor", parser: "feed", searchQueries: ["inbound marketing", "lead generation", "email marketing"] }),
      s("content-marketing-institute", "Content Marketing Institute", "https://contentmarketinginstitute.com/feed/", "rss", ["content-strategy", "distribution"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["content strategy", "editorial calendar", "distribution"] }),
      s("social-media-today", "Social Media Today", "https://www.socialmediatoday.com/feed/", "rss", ["social", "trends", "enterprise"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["social trends", "platform updates", "enterprise social"] }),
      s("orbit-media", "Orbit Media", "https://www.orbitmedia.com/blog/feed/", "rss", ["content", "analytics", "strategy"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["blogging", "analytics", "web strategy"] }),
      s("sprout-social", "Sprout Social Insights", "https://sproutsocial.com/insights/feed/", "rss", ["social", "data", "engagement"], { mode: "discover", trust: "vendor", parser: "feed", searchQueries: ["social analytics", "engagement", "brand monitoring"] }),
      s("product-hunt", "Product Hunt", "https://www.producthunt.com/feed", "rss", ["launches", "products", "distribution"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["product launch", "saas", "tools"] }),
      s("signal-radar", "Hacker News Front Page", "https://hnrss.org/frontpage", "rss", ["hn", "signal", "tech-news"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["show hn", "tech news", "startups"] })
    ]
  },
  {
    slug: "infra",
    title: "Infra",
    strapline: "Hosting, edge compute, observability, and platform plumbing.",
    description:
      "Infra signals focused on deploy surfaces, storage, performance, and platform capability shifts.",
    hero: "For the infrastructure layer you do care about, even when you claim you do not.",
    accent: "signal-blue",
    icon: "server",
    status: "seeded",
    keywords: ["infra", "hosting", "edge", "observability", "serverless", "platform"],
    sources: [
      s("cloudflare-blog", "Cloudflare Blog", "https://blog.cloudflare.com/rss/", "rss", ["cloudflare", "edge", "workers"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["workers", "r2", "d1", "edge", "waf"] }),
      s("vercel-blog-infra", "Vercel Blog", "https://vercel.com/atom", "atom", ["vercel", "serverless", "edge"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["functions", "edge", "deploy", "storage"] }),
      s("aws-blog", "AWS Blog", "https://aws.amazon.com/blogs/aws/feed/", "rss", ["aws", "cloud", "compute"], { mode: "discover", trust: "official", parser: "feed", searchQueries: ["lambda", "s3", "ec2", "serverless", "cdk"] }),
      s("the-new-stack", "The New Stack", "https://thenewstack.io/feed/", "rss", ["devops", "cloud-native", "platform"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["cloud native", "kubernetes", "platform engineering"] }),
      s("fly-io-blog", "Fly.io Blog", "https://fly.io/blog/feed.xml", "rss", ["fly", "edge", "deploy"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["fly machines", "edge", "postgres", "deploy"] }),
      s("supabase-blog", "Supabase Blog", "https://supabase.com/blog/rss.xml", "rss", ["supabase", "postgres", "storage"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["supabase", "postgres", "storage", "auth", "realtime"] }),
      s("deno-blog", "Deno Blog", "https://deno.com/blog/feed", "rss", ["deno", "runtime", "deploy"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["deno", "fresh", "deploy", "runtime"] }),
      s("kubernetes-blog", "Kubernetes Blog", "https://kubernetes.io/feed.xml", "rss", ["kubernetes", "orchestration"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["kubernetes", "pods", "gateway api", "scheduling"] }),
      s("hashicorp-blog", "HashiCorp Blog", "https://www.hashicorp.com/blog/feed.xml", "rss", ["terraform", "vault", "iac"], { mode: "discover", trust: "official", parser: "feed", searchQueries: ["terraform", "vault", "consul", "nomad"] }),
      s("grafana-blog", "Grafana Blog", "https://grafana.com/blog/index.xml", "rss", ["observability", "monitoring", "dashboards"], { mode: "discover", trust: "official", parser: "feed", searchQueries: ["grafana", "loki", "tempo", "alloy", "dashboards"] })
    ]
  },
  {
    slug: "containers",
    title: "Containers",
    strapline: "Docker, OCI, runtime images, and container ergonomics.",
    description:
      "A dedicated lane for container signals so infra notes stop getting buried in generic ops noise.",
    hero: "Container changes worth caring about, minus the usual YAML-induced Stockholm syndrome.",
    accent: "signal-red",
    icon: "box",
    status: "seeded",
    keywords: ["container", "docker", "oci", "kubernetes", "podman"],
    sources: [
      s("docker-blog", "Docker Blog", "https://www.docker.com/blog/feed/", "rss", ["docker", "containers"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["docker", "dockerfile", "compose", "buildx"] }),
      s("containerd-releases", "containerd Releases", "https://github.com/containerd/containerd/releases.atom", "atom", ["containerd", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["containerd", "runtime"] }),
      s("kubernetes-blog-ct", "Kubernetes Blog", "https://kubernetes.io/feed.xml", "rss", ["kubernetes", "pods", "scheduling"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["kubernetes", "container", "pod", "cri"] }),
      s("cncf-blog", "CNCF Blog", "https://www.cncf.io/blog/feed/", "rss", ["cncf", "cloud-native", "governance"], { mode: "discover", trust: "standards", parser: "feed", searchQueries: ["cncf", "graduated", "incubating", "sandbox"] }),
      s("helm-releases", "Helm Releases", "https://github.com/helm/helm/releases.atom", "atom", ["helm", "charts", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["helm", "chart", "package"] }),
      s("istio-blog", "Istio Blog", "https://istio.io/latest/blog/feed.xml", "rss", ["istio", "service-mesh"], { mode: "discover", trust: "official", parser: "feed", searchQueries: ["istio", "envoy", "service mesh", "sidecar"] }),
      s("oci-image-spec", "OCI Image Spec Releases", "https://github.com/opencontainers/image-spec/releases.atom", "atom", ["oci", "image-spec", "releases"], { mode: "track", trust: "standards", parser: "feed", searchQueries: ["oci", "image spec", "container image"] }),
      s("buildkit-releases", "BuildKit Releases", "https://github.com/moby/buildkit/releases.atom", "atom", ["buildkit", "builds", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["buildkit", "build", "cache", "moby"] }),
      s("k8s-cve-feed", "Kubernetes CVE Feed", "https://kubernetes.io/docs/reference/issues-security/official-cve-feed/feed.xml", "rss", ["kubernetes", "security", "cve"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["cve", "vulnerability", "kubernetes security"] }),
      s("docker-compose-releases", "Docker Compose Releases", "https://github.com/docker/compose/releases.atom", "atom", ["docker-compose", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["compose", "docker compose"] })
    ]
  },
  {
    slug: "a2a",
    title: "A2A",
    strapline: "Agents, agent-to-agent patterns, tool orchestration, and protocol watch.",
    description:
      "A daily desk for agent systems, orchestration patterns, provider changes, and protocol-level moves.",
    hero: "Where agent infrastructure, orchestration, and protocol work gets distilled into something usable.",
    accent: "signal-gold",
    icon: "brain",
    status: "seeded",
    keywords: ["agent", "a2a", "orchestration", "tools", "mcp", "sdk"],
    sources: [
      s("openai-news", "OpenAI News", "https://openai.com/news/rss.xml", "rss", ["openai", "models", "agents"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["gpt", "agents", "tool calling", "api"] }),
      s("anthropic-news", "Anthropic News", "https://www.anthropic.com/news", "docs", ["anthropic", "claude", "safety"], { mode: "discover", trust: "official", parser: "html-links", searchQueries: ["claude", "tool use", "mcp", "computer use", "prompting"] }),
      s("vercel-ai-blog", "Vercel AI Blog", "https://vercel.com/atom", "atom", ["ai-sdk", "vercel", "agents"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["ai sdk", "agents", "ai gateway", "streaming"] }),
      s("google-ai-blog-a2a", "Google AI Blog", "https://blog.google/technology/ai/rss/", "rss", ["google", "gemini", "models"], { mode: "discover", trust: "official", parser: "feed", searchQueries: ["gemini", "a2a", "agents", "grounding"] }),
      s("huggingface-blog", "Hugging Face Blog", "https://huggingface.co/blog/feed.xml", "rss", ["huggingface", "models", "open-source"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["transformers", "agents", "open weights", "inference"] }),
      s("langchain-blog", "LangChain Blog", "https://blog.langchain.dev/rss/", "rss", ["langchain", "agents", "chains"], { mode: "discover", trust: "vendor", parser: "feed", searchQueries: ["langgraph", "agents", "rag", "tool calling"] }),
      s("ai-sdk-releases", "AI SDK Releases", "https://github.com/vercel/ai/releases.atom", "atom", ["ai-sdk", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["ai sdk", "tool", "streaming", "provider"] }),
      s("mcp-spec-releases", "MCP Spec Releases", "https://github.com/modelcontextprotocol/specification/releases.atom", "atom", ["mcp", "protocol", "releases"], { mode: "track", trust: "standards", parser: "feed", searchQueries: ["mcp", "protocol", "transport", "tool"] }),
      s("arxiv-cs-ai", "arXiv cs.AI", "https://rss.arxiv.org/rss/cs.AI", "rss", ["arxiv", "research", "papers"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["agent", "reasoning", "planning", "tool use"] }),
      s("arxiv-cs-cl", "arXiv cs.CL", "https://rss.arxiv.org/rss/cs.CL", "rss", ["arxiv", "nlp", "llm-research"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["language model", "instruction tuning", "alignment", "prompting"] })
    ]
  },
  {
    slug: "security",
    title: "Security",
    strapline: "Threat models, secure defaults, and hardening playbooks.",
    description:
      "Security review and threat-model skills surfaced alongside the same daily signal machinery.",
    hero: "Because the security pass should not be the scene where everyone suddenly remembers consequences exist.",
    accent: "signal-blue",
    icon: "shield",
    status: "live",
    keywords: ["security", "threat", "auth", "abuse", "hardening"],
    sources: [
      s("github-advisory", "GitHub Security Advisories", "https://github.com/advisories?query=type%3Areviewed+ecosystem%3Anpm", "docs", ["security", "npm", "advisories"], { mode: "discover", trust: "official", parser: "html-links", searchQueries: ["npm", "advisory", "critical", "high", "cve"] }),
      s("portswigger-research", "PortSwigger Research", "https://portswigger.net/research/rss", "rss", ["web-security", "research", "exploits"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["xss", "ssrf", "injection", "bypass", "web security"] }),
      s("krebs-security", "Krebs on Security", "https://krebsonsecurity.com/feed/", "rss", ["security", "breaches", "industry"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["breach", "ransomware", "phishing", "credential"] }),
      s("owasp-blog", "OWASP Blog", "https://owasp.org/feed.xml", "rss", ["owasp", "appsec", "standards"], { mode: "track", trust: "standards", parser: "feed", searchQueries: ["owasp top 10", "appsec", "secure coding"] }),
      s("the-hacker-news", "The Hacker News", "https://feeds.feedburner.com/TheHackersNews", "rss", ["security", "vulnerabilities", "news"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["vulnerability", "zero-day", "malware", "threat"] }),
      s("troy-hunt", "Troy Hunt", "https://www.troyhunt.com/rss/", "rss", ["security", "breaches", "identity"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["have i been pwned", "breach", "password", "identity"] }),
      s("schneier-on-security", "Schneier on Security", "https://www.schneier.com/feed/", "rss", ["security", "cryptography", "policy"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["cryptography", "surveillance", "security policy"] }),
      s("security-boulevard", "Security Boulevard", "https://securityboulevard.com/feed/", "rss", ["appsec", "devsecops", "analysis"], { mode: "discover", trust: "community", parser: "feed", searchQueries: ["devsecops", "supply chain", "appsec"] }),
      s("project-zero", "Google Project Zero", "https://googleprojectzero.blogspot.com/feeds/posts/default", "atom", ["google", "zero-day", "research"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["zero-day", "exploit", "vulnerability research"] }),
      s("nodejs-security", "Node.js Security Releases", "https://github.com/nodejs/node/releases.atom", "atom", ["nodejs", "security", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["nodejs", "security release", "cve"] })
    ]
  },
  {
    slug: "ops",
    title: "Ops",
    strapline: "GitHub, Linear, maintenance automation, and internal workflow glue.",
    description:
      "Operational skills for CI, issue triage, release hygiene, and the less glamorous parts of shipping.",
    hero: "The glue code and operational muscle memory that keeps the rest of the machine from face-planting.",
    accent: "signal-gold",
    icon: "settings",
    status: "live",
    keywords: ["ops", "github", "linear", "automation", "maintenance", "workflow"],
    sources: [
      s("github-blog", "GitHub Blog", "https://github.blog/feed/", "rss", ["github", "features", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["github", "copilot", "actions", "security"] }),
      s("github-changelog", "GitHub Changelog", "https://github.blog/changelog/feed/", "rss", ["github", "changelog", "api"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["api", "actions", "packages", "codespaces"] }),
      s("linear-changelog", "Linear Changelog", "https://linear.app/changelog", "docs", ["linear", "issues", "workflow"], { mode: "discover", trust: "official", parser: "html-links", searchQueries: ["linear", "issues", "projects", "triage", "cycles"] }),
      s("sentry-blog", "Sentry Blog", "https://blog.sentry.io/feed.xml", "rss", ["sentry", "errors", "observability"], { mode: "discover", trust: "official", parser: "feed", searchQueries: ["sentry", "error tracking", "performance", "tracing"] }),
      s("gitlab-blog", "GitLab Blog", "https://about.gitlab.com/atom.xml", "atom", ["gitlab", "ci-cd", "devops"], { mode: "discover", trust: "official", parser: "feed", searchQueries: ["gitlab", "ci", "pipeline", "devops"] }),
      s("github-actions-runner", "Actions Runner Releases", "https://github.com/actions/runner/releases.atom", "atom", ["github-actions", "ci", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["actions runner", "ci", "workflow"] }),
      s("turborepo-releases", "Turborepo Releases", "https://github.com/vercel/turborepo/releases.atom", "atom", ["turborepo", "monorepo", "builds"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["turborepo", "monorepo", "cache", "tasks"] }),
      s("pnpm-releases", "pnpm Releases", "https://github.com/pnpm/pnpm/releases.atom", "atom", ["pnpm", "packages", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["pnpm", "workspace", "lockfile"] }),
      s("eslint-releases", "ESLint Releases", "https://github.com/eslint/eslint/releases.atom", "atom", ["eslint", "linting", "releases"], { mode: "track", trust: "official", parser: "feed", searchQueries: ["eslint", "flat config", "rules"] }),
      s("datadog-blog", "Datadog Blog", "https://www.datadoghq.com/blog/feed/", "rss", ["datadog", "monitoring", "apm"], { mode: "discover", trust: "vendor", parser: "feed", searchQueries: ["datadog", "apm", "monitoring", "logs"] })
    ]
  }
];

export const FEATURED_SKILLS = new Set([
  "frontend-frontier",
  "seo-geo",
  "social-content-os",
  "social-draft",
  "security-best-practices",
  "security-threat-model",
  "gh-fix-ci",
  "linear"
]);

export const SKILL_OVERRIDES: Partial<
  Record<
    string,
    {
      category: CategorySlug;
      accent: string;
      visibility: "public" | "member";
      tags: string[];
    }
  >
> = {
  "frontend-frontier": {
    category: "frontend",
    accent: "signal-red",
    visibility: "public",
    tags: ["featured", "editorial-ui", "motion"]
  },
  "seo-geo": {
    category: "seo-geo",
    accent: "signal-blue",
    visibility: "public",
    tags: ["featured", "citability", "schema"]
  },
  "social-content-os": {
    category: "social",
    accent: "signal-gold",
    visibility: "public",
    tags: ["content", "distribution"]
  },
  "social-draft": {
    category: "social",
    accent: "signal-gold",
    visibility: "public",
    tags: ["drafting", "copy"]
  },
  "security-best-practices": {
    category: "security",
    accent: "signal-blue",
    visibility: "member",
    tags: ["hardening", "review"]
  },
  "security-threat-model": {
    category: "security",
    accent: "signal-blue",
    visibility: "member",
    tags: ["threat-model", "appsec"]
  },
  linear: {
    category: "ops",
    accent: "signal-gold",
    visibility: "member",
    tags: ["workflow", "issues"]
  },
  "gh-fix-ci": {
    category: "ops",
    accent: "signal-gold",
    visibility: "member",
    tags: ["ci", "github"]
  }
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    slug: "free",
    title: "Free",
    priceLabel: "$0",
    interval: "forever",
    ctaLabel: "Reading now",
    description: "Browse the catalog, create 1 skill, and explore the Sandbox.",
    features: ["1 skill", "Catalog access", "Sandbox", "Skill downloads"]
  },
  {
    slug: "operator",
    title: "Operator",
    priceLabel: "$19",
    interval: "per month",
    ctaLabel: "Unlock operator tools",
    description: "Unlimited skills, AI automations, custom imports, marketplace pricing, and payouts.",
    features: [
      "Unlimited skills",
      "AI-powered automations",
      "Custom import sources",
      "Marketplace pricing & payouts"
    ]
  }
];
