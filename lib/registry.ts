import { computeSourceLogoUrl } from "@/lib/skill-icons";
import type {
  CategoryDefinition,
  CategorySlug,
  MembershipPlan,
  SourceMode,
  SourceTrustTier,
  SourceParser,
} from "@/lib/types";

interface SourceMeta {
  mode?: SourceMode;
  trust?: SourceTrustTier;
  parser?: SourceParser;
  searchQueries?: string[];
}

function s(
  id: string,
  label: string,
  url: string,
  kind: "rss" | "atom" | "docs",
  tags: string[],
  meta?: SourceMeta
) {
  return {
    id,
    kind,
    label,
    logoUrl: computeSourceLogoUrl(url),
    tags,
    url,
    ...meta,
  } as const;
}

export const CATEGORY_REGISTRY: CategoryDefinition[] = [
  {
    accent: "signal-red",
    description:
      "Editorial UI craft, motion systems, design-engineering references, and production-ready frontend skills.",
    hero: "Daily frontend radar with local skills, source pulls, and reusable agent prompts.",
    icon: "palette",
    keywords: [
      "frontend",
      "motion",
      "design",
      "react",
      "next.js",
      "ui",
      "animation",
    ],
    slug: "frontend",
    sources: [
      s(
        "vercel-blog",
        "Vercel Blog",
        "https://vercel.com/atom",
        "atom",
        ["vercel", "next.js", "frontend"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["next.js", "vercel", "edge", "turbopack"],
          trust: "official",
        }
      ),
      s(
        "react-blog",
        "React Blog",
        "https://react.dev/rss.xml",
        "rss",
        ["react", "frontend"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["react", "compiler", "server components", "suspense"],
          trust: "official",
        }
      ),
      s(
        "nextjs-releases",
        "Next.js Releases",
        "https://github.com/vercel/next.js/releases.atom",
        "atom",
        ["next.js", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["next.js", "app router", "turbopack"],
          trust: "official",
        }
      ),
      s(
        "web-dev-blog",
        "web.dev",
        "https://web.dev/blog/feed.xml",
        "rss",
        ["chrome", "web-platform", "performance"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: [
            "core web vitals",
            "performance",
            "css",
            "web platform",
          ],
          trust: "official",
        }
      ),
      s(
        "chrome-devrel",
        "Chrome DevRel",
        "https://developer.chrome.com/static/blog/feed.xml",
        "rss",
        ["chrome", "devtools", "web-platform"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["devtools", "chrome", "css", "api"],
          trust: "official",
        }
      ),
      s(
        "smashing-magazine",
        "Smashing Magazine",
        "https://www.smashingmagazine.com/feed/",
        "rss",
        ["frontend", "css", "ux"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "css",
            "accessibility",
            "design systems",
            "animation",
          ],
          trust: "community",
        }
      ),
      s(
        "webkit-blog",
        "WebKit Blog",
        "https://webkit.org/feed/",
        "rss",
        ["webkit", "safari", "web-platform"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["webkit", "safari", "css", "web api"],
          trust: "official",
        }
      ),
      s(
        "frontend-masters",
        "Frontend Masters Blog",
        "https://frontendmasters.com/blog/feed/",
        "rss",
        ["frontend", "tutorials"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["frontend", "react", "typescript", "css"],
          trust: "community",
        }
      ),
      s(
        "typescript-releases",
        "TypeScript Releases",
        "https://github.com/microsoft/TypeScript/releases.atom",
        "atom",
        ["typescript", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["typescript", "type system"],
          trust: "official",
        }
      ),
      s(
        "tailwind-releases",
        "Tailwind CSS Releases",
        "https://github.com/tailwindlabs/tailwindcss/releases.atom",
        "atom",
        ["tailwind", "css", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["tailwind", "css", "utility"],
          trust: "official",
        }
      ),
      s(
        "motion-releases",
        "Motion Releases",
        "https://github.com/motiondivision/motion/releases.atom",
        "atom",
        ["motion", "animation", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["motion", "framer", "animation"],
          trust: "official",
        }
      ),
    ],
    status: "live",
    strapline: "Design engineering, motion, and signal-rich UI systems.",
    title: "Frontend",
  },
  {
    accent: "signal-blue",
    description:
      "Living operational guidance for search, generative-engine optimization, structured data, and source quality.",
    hero: "Track crawler, citation, and entity-surface shifts without drowning in acronym soup.",
    icon: "search",
    keywords: [
      "seo",
      "geo",
      "aeo",
      "search",
      "schema",
      "crawler",
      "citability",
    ],
    slug: "seo-geo",
    sources: [
      s(
        "google-search-central",
        "Google Search Central",
        "https://developers.google.com/search/blog",
        "docs",
        ["google", "search", "crawlers"],
        {
          mode: "discover",
          parser: "html-links",
          searchQueries: [
            "search console",
            "crawling",
            "indexing",
            "structured data",
            "core update",
          ],
          trust: "official",
        }
      ),
      s(
        "moz-blog",
        "Moz Blog",
        "https://moz.com/blog/feed",
        "rss",
        ["seo", "link-building", "research"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["seo", "domain authority", "link building", "serp"],
          trust: "community",
        }
      ),
      s(
        "search-engine-land",
        "Search Engine Land",
        "https://searchengineland.com/feed",
        "rss",
        ["seo", "sem", "industry"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["google update", "seo", "ppc", "search algorithm"],
          trust: "community",
        }
      ),
      s(
        "search-engine-journal",
        "Search Engine Journal",
        "https://www.searchenginejournal.com/feed/",
        "rss",
        ["seo", "tutorials", "news"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "seo strategy",
            "content optimization",
            "technical seo",
          ],
          trust: "community",
        }
      ),
      s(
        "ahrefs-blog",
        "Ahrefs Blog",
        "https://ahrefs.com/blog/feed/",
        "rss",
        ["seo", "keywords", "backlinks"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "backlinks",
            "keyword research",
            "site audit",
            "rank tracking",
          ],
          trust: "vendor",
        }
      ),
      s(
        "semrush-blog",
        "Semrush Blog",
        "https://www.semrush.com/blog/feed/",
        "rss",
        ["seo", "content-strategy", "sem"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "competitive analysis",
            "content marketing",
            "seo audit",
          ],
          trust: "vendor",
        }
      ),
      s(
        "yoast-blog",
        "Yoast Blog",
        "https://yoast.com/feed/",
        "rss",
        ["seo", "wordpress", "technical-seo"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "schema markup",
            "readability",
            "technical seo",
            "wordpress",
          ],
          trust: "vendor",
        }
      ),
      s(
        "schema-org-releases",
        "Schema.org Releases",
        "https://github.com/schemaorg/schemaorg/releases.atom",
        "atom",
        ["schema", "structured-data", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["schema.org", "structured data", "json-ld"],
          trust: "standards",
        }
      ),
      s(
        "google-ai-blog",
        "Google AI Blog",
        "https://blog.google/technology/ai/rss/",
        "rss",
        ["google", "ai-search", "geo"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["ai overview", "gemini", "search generative", "geo"],
          trust: "official",
        }
      ),
      s(
        "bing-webmaster",
        "Bing Webmaster Blog",
        "https://blogs.bing.com/webmaster/feed",
        "rss",
        ["bing", "search", "crawlers"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["bing", "indexnow", "crawler", "webmaster"],
          trust: "official",
        }
      ),
    ],
    status: "live",
    strapline: "Search visibility, entity coverage, and AI citability.",
    title: "SEO + GEO",
  },
  {
    accent: "signal-gold",
    description:
      "Turn signals into ranked content backlogs, sharper drafts, and repeatable publishing systems.",
    hero: "The content side of the machine: what to say, how to say it, and why anyone should care.",
    icon: "megaphone",
    keywords: ["social", "content", "linkedin", "x", "post", "distribution"],
    slug: "social",
    sources: [
      s(
        "social-media-examiner",
        "Social Media Examiner",
        "https://www.socialmediaexaminer.com/feed/",
        "rss",
        ["social", "strategy", "ads"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "social media strategy",
            "algorithm",
            "engagement",
            "ads",
          ],
          trust: "community",
        }
      ),
      s(
        "buffer-blog",
        "Buffer Blog",
        "https://buffer.com/resources/feed/",
        "rss",
        ["social", "scheduling", "analytics"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["scheduling", "analytics", "social publishing"],
          trust: "vendor",
        }
      ),
      s(
        "copyblogger",
        "Copyblogger",
        "https://copyblogger.com/feed/",
        "rss",
        ["copywriting", "content-marketing"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["copywriting", "headlines", "persuasion", "content"],
          trust: "community",
        }
      ),
      s(
        "hubspot-marketing",
        "HubSpot Marketing",
        "https://blog.hubspot.com/marketing/rss.xml",
        "rss",
        ["inbound", "marketing", "seo"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "inbound marketing",
            "lead generation",
            "email marketing",
          ],
          trust: "vendor",
        }
      ),
      s(
        "content-marketing-institute",
        "Content Marketing Institute",
        "https://contentmarketinginstitute.com/feed/",
        "rss",
        ["content-strategy", "distribution"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "content strategy",
            "editorial calendar",
            "distribution",
          ],
          trust: "community",
        }
      ),
      s(
        "social-media-today",
        "Social Media Today",
        "https://www.socialmediatoday.com/feed/",
        "rss",
        ["social", "trends", "enterprise"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "social trends",
            "platform updates",
            "enterprise social",
          ],
          trust: "community",
        }
      ),
      s(
        "orbit-media",
        "Orbit Media",
        "https://www.orbitmedia.com/blog/feed/",
        "rss",
        ["content", "analytics", "strategy"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["blogging", "analytics", "web strategy"],
          trust: "community",
        }
      ),
      s(
        "sprout-social",
        "Sprout Social Insights",
        "https://sproutsocial.com/insights/feed/",
        "rss",
        ["social", "data", "engagement"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["social analytics", "engagement", "brand monitoring"],
          trust: "vendor",
        }
      ),
      s(
        "product-hunt",
        "Product Hunt",
        "https://www.producthunt.com/feed",
        "rss",
        ["launches", "products", "distribution"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["product launch", "saas", "tools"],
          trust: "community",
        }
      ),
      s(
        "signal-radar",
        "Hacker News Front Page",
        "https://hnrss.org/frontpage",
        "rss",
        ["hn", "signal", "tech-news"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["show hn", "tech news", "startups"],
          trust: "community",
        }
      ),
    ],
    status: "live",
    strapline:
      "Post operating systems, drafts, and proof-backed publishing loops.",
    title: "Social Systems",
  },
  {
    accent: "signal-blue",
    description:
      "Infra signals focused on deploy surfaces, storage, performance, and platform capability shifts.",
    hero: "For the infrastructure layer you do care about, even when you claim you do not.",
    icon: "server",
    keywords: [
      "infra",
      "hosting",
      "edge",
      "observability",
      "serverless",
      "platform",
    ],
    slug: "infra",
    sources: [
      s(
        "cloudflare-blog",
        "Cloudflare Blog",
        "https://blog.cloudflare.com/rss/",
        "rss",
        ["cloudflare", "edge", "workers"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["workers", "r2", "d1", "edge", "waf"],
          trust: "official",
        }
      ),
      s(
        "vercel-blog-infra",
        "Vercel Blog",
        "https://vercel.com/atom",
        "atom",
        ["vercel", "serverless", "edge"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["functions", "edge", "deploy", "storage"],
          trust: "official",
        }
      ),
      s(
        "aws-blog",
        "AWS Blog",
        "https://aws.amazon.com/blogs/aws/feed/",
        "rss",
        ["aws", "cloud", "compute"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["lambda", "s3", "ec2", "serverless", "cdk"],
          trust: "official",
        }
      ),
      s(
        "the-new-stack",
        "The New Stack",
        "https://thenewstack.io/feed/",
        "rss",
        ["devops", "cloud-native", "platform"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["cloud native", "kubernetes", "platform engineering"],
          trust: "community",
        }
      ),
      s(
        "fly-io-blog",
        "Fly.io Blog",
        "https://fly.io/blog/feed.xml",
        "rss",
        ["fly", "edge", "deploy"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["fly machines", "edge", "postgres", "deploy"],
          trust: "official",
        }
      ),
      s(
        "supabase-blog",
        "Supabase Blog",
        "https://supabase.com/blog/rss.xml",
        "rss",
        ["supabase", "postgres", "storage"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: [
            "supabase",
            "postgres",
            "storage",
            "auth",
            "realtime",
          ],
          trust: "official",
        }
      ),
      s(
        "deno-blog",
        "Deno Blog",
        "https://deno.com/blog/feed",
        "rss",
        ["deno", "runtime", "deploy"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["deno", "fresh", "deploy", "runtime"],
          trust: "official",
        }
      ),
      s(
        "kubernetes-blog",
        "Kubernetes Blog",
        "https://kubernetes.io/feed.xml",
        "rss",
        ["kubernetes", "orchestration"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["kubernetes", "pods", "gateway api", "scheduling"],
          trust: "official",
        }
      ),
      s(
        "hashicorp-blog",
        "HashiCorp Blog",
        "https://www.hashicorp.com/blog/feed.xml",
        "rss",
        ["terraform", "vault", "iac"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["terraform", "vault", "consul", "nomad"],
          trust: "official",
        }
      ),
      s(
        "grafana-blog",
        "Grafana Blog",
        "https://grafana.com/blog/index.xml",
        "rss",
        ["observability", "monitoring", "dashboards"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["grafana", "loki", "tempo", "alloy", "dashboards"],
          trust: "official",
        }
      ),
    ],
    status: "seeded",
    strapline: "Hosting, edge compute, observability, and platform plumbing.",
    title: "Infra",
  },
  {
    accent: "signal-red",
    description:
      "A dedicated lane for container signals so infra notes stop getting buried in generic ops noise.",
    hero: "Container changes worth caring about, minus the usual YAML-induced Stockholm syndrome.",
    icon: "box",
    keywords: ["container", "docker", "oci", "kubernetes", "podman"],
    slug: "containers",
    sources: [
      s(
        "docker-blog",
        "Docker Blog",
        "https://www.docker.com/blog/feed/",
        "rss",
        ["docker", "containers"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["docker", "dockerfile", "compose", "buildx"],
          trust: "official",
        }
      ),
      s(
        "containerd-releases",
        "containerd Releases",
        "https://github.com/containerd/containerd/releases.atom",
        "atom",
        ["containerd", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["containerd", "runtime"],
          trust: "official",
        }
      ),
      s(
        "kubernetes-blog-ct",
        "Kubernetes Blog",
        "https://kubernetes.io/feed.xml",
        "rss",
        ["kubernetes", "pods", "scheduling"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["kubernetes", "container", "pod", "cri"],
          trust: "official",
        }
      ),
      s(
        "cncf-blog",
        "CNCF Blog",
        "https://www.cncf.io/blog/feed/",
        "rss",
        ["cncf", "cloud-native", "governance"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["cncf", "graduated", "incubating", "sandbox"],
          trust: "standards",
        }
      ),
      s(
        "helm-releases",
        "Helm Releases",
        "https://github.com/helm/helm/releases.atom",
        "atom",
        ["helm", "charts", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["helm", "chart", "package"],
          trust: "official",
        }
      ),
      s(
        "istio-blog",
        "Istio Blog",
        "https://istio.io/latest/blog/feed.xml",
        "rss",
        ["istio", "service-mesh"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["istio", "envoy", "service mesh", "sidecar"],
          trust: "official",
        }
      ),
      s(
        "oci-image-spec",
        "OCI Image Spec Releases",
        "https://github.com/opencontainers/image-spec/releases.atom",
        "atom",
        ["oci", "image-spec", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["oci", "image spec", "container image"],
          trust: "standards",
        }
      ),
      s(
        "buildkit-releases",
        "BuildKit Releases",
        "https://github.com/moby/buildkit/releases.atom",
        "atom",
        ["buildkit", "builds", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["buildkit", "build", "cache", "moby"],
          trust: "official",
        }
      ),
      s(
        "k8s-cve-feed",
        "Kubernetes CVE Feed",
        "https://kubernetes.io/docs/reference/issues-security/official-cve-feed/feed.xml",
        "rss",
        ["kubernetes", "security", "cve"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["cve", "vulnerability", "kubernetes security"],
          trust: "official",
        }
      ),
      s(
        "docker-compose-releases",
        "Docker Compose Releases",
        "https://github.com/docker/compose/releases.atom",
        "atom",
        ["docker-compose", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["compose", "docker compose"],
          trust: "official",
        }
      ),
    ],
    status: "seeded",
    strapline: "Docker, OCI, runtime images, and container ergonomics.",
    title: "Containers",
  },
  {
    accent: "signal-gold",
    description:
      "A daily desk for agent systems, orchestration patterns, provider changes, and protocol-level moves.",
    hero: "Where agent infrastructure, orchestration, and protocol work gets distilled into something usable.",
    icon: "brain",
    keywords: ["agent", "a2a", "orchestration", "tools", "mcp", "sdk"],
    slug: "a2a",
    sources: [
      s(
        "openai-news",
        "OpenAI News",
        "https://openai.com/news/rss.xml",
        "rss",
        ["openai", "models", "agents"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["gpt", "agents", "tool calling", "api"],
          trust: "official",
        }
      ),
      s(
        "anthropic-news",
        "Anthropic News",
        "https://www.anthropic.com/news",
        "docs",
        ["anthropic", "claude", "safety"],
        {
          mode: "discover",
          parser: "html-links",
          searchQueries: [
            "claude",
            "tool use",
            "mcp",
            "computer use",
            "prompting",
          ],
          trust: "official",
        }
      ),
      s(
        "vercel-ai-blog",
        "Vercel AI Blog",
        "https://vercel.com/atom",
        "atom",
        ["ai-sdk", "vercel", "agents"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["ai sdk", "agents", "ai gateway", "streaming"],
          trust: "official",
        }
      ),
      s(
        "google-ai-blog-a2a",
        "Google AI Blog",
        "https://blog.google/technology/ai/rss/",
        "rss",
        ["google", "gemini", "models"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["gemini", "a2a", "agents", "grounding"],
          trust: "official",
        }
      ),
      s(
        "huggingface-blog",
        "Hugging Face Blog",
        "https://huggingface.co/blog/feed.xml",
        "rss",
        ["huggingface", "models", "open-source"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "transformers",
            "agents",
            "open weights",
            "inference",
          ],
          trust: "community",
        }
      ),
      s(
        "langchain-blog",
        "LangChain Blog",
        "https://blog.langchain.dev/rss/",
        "rss",
        ["langchain", "agents", "chains"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["langgraph", "agents", "rag", "tool calling"],
          trust: "vendor",
        }
      ),
      s(
        "ai-sdk-releases",
        "AI SDK Releases",
        "https://github.com/vercel/ai/releases.atom",
        "atom",
        ["ai-sdk", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["ai sdk", "tool", "streaming", "provider"],
          trust: "official",
        }
      ),
      s(
        "mcp-spec-releases",
        "MCP Spec Releases",
        "https://github.com/modelcontextprotocol/specification/releases.atom",
        "atom",
        ["mcp", "protocol", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["mcp", "protocol", "transport", "tool"],
          trust: "standards",
        }
      ),
      s(
        "arxiv-cs-ai",
        "arXiv cs.AI",
        "https://rss.arxiv.org/rss/cs.AI",
        "rss",
        ["arxiv", "research", "papers"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["agent", "reasoning", "planning", "tool use"],
          trust: "community",
        }
      ),
      s(
        "arxiv-cs-cl",
        "arXiv cs.CL",
        "https://rss.arxiv.org/rss/cs.CL",
        "rss",
        ["arxiv", "nlp", "llm-research"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "language model",
            "instruction tuning",
            "alignment",
            "prompting",
          ],
          trust: "community",
        }
      ),
    ],
    status: "seeded",
    strapline:
      "Agents, agent-to-agent patterns, tool orchestration, and protocol watch.",
    title: "A2A",
  },
  {
    accent: "signal-blue",
    description:
      "Security review and threat-model skills surfaced alongside the same daily signal machinery.",
    hero: "Because the security pass should not be the scene where everyone suddenly remembers consequences exist.",
    icon: "shield",
    keywords: ["security", "threat", "auth", "abuse", "hardening"],
    slug: "security",
    sources: [
      s(
        "github-advisory",
        "GitHub Security Advisories",
        "https://github.com/advisories?query=type%3Areviewed+ecosystem%3Anpm",
        "docs",
        ["security", "npm", "advisories"],
        {
          mode: "discover",
          parser: "html-links",
          searchQueries: ["npm", "advisory", "critical", "high", "cve"],
          trust: "official",
        }
      ),
      s(
        "portswigger-research",
        "PortSwigger Research",
        "https://portswigger.net/research/rss",
        "rss",
        ["web-security", "research", "exploits"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["xss", "ssrf", "injection", "bypass", "web security"],
          trust: "community",
        }
      ),
      s(
        "krebs-security",
        "Krebs on Security",
        "https://krebsonsecurity.com/feed/",
        "rss",
        ["security", "breaches", "industry"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["breach", "ransomware", "phishing", "credential"],
          trust: "community",
        }
      ),
      s(
        "owasp-blog",
        "OWASP Blog",
        "https://owasp.org/feed.xml",
        "rss",
        ["owasp", "appsec", "standards"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["owasp top 10", "appsec", "secure coding"],
          trust: "standards",
        }
      ),
      s(
        "the-hacker-news",
        "The Hacker News",
        "https://feeds.feedburner.com/TheHackersNews",
        "rss",
        ["security", "vulnerabilities", "news"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["vulnerability", "zero-day", "malware", "threat"],
          trust: "community",
        }
      ),
      s(
        "troy-hunt",
        "Troy Hunt",
        "https://www.troyhunt.com/rss/",
        "rss",
        ["security", "breaches", "identity"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: [
            "have i been pwned",
            "breach",
            "password",
            "identity",
          ],
          trust: "community",
        }
      ),
      s(
        "schneier-on-security",
        "Schneier on Security",
        "https://www.schneier.com/feed/",
        "rss",
        ["security", "cryptography", "policy"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["cryptography", "surveillance", "security policy"],
          trust: "community",
        }
      ),
      s(
        "security-boulevard",
        "Security Boulevard",
        "https://securityboulevard.com/feed/",
        "rss",
        ["appsec", "devsecops", "analysis"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["devsecops", "supply chain", "appsec"],
          trust: "community",
        }
      ),
      s(
        "project-zero",
        "Google Project Zero",
        "https://googleprojectzero.blogspot.com/feeds/posts/default",
        "atom",
        ["google", "zero-day", "research"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["zero-day", "exploit", "vulnerability research"],
          trust: "official",
        }
      ),
      s(
        "nodejs-security",
        "Node.js Security Releases",
        "https://github.com/nodejs/node/releases.atom",
        "atom",
        ["nodejs", "security", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["nodejs", "security release", "cve"],
          trust: "official",
        }
      ),
    ],
    status: "live",
    strapline: "Threat models, secure defaults, and hardening playbooks.",
    title: "Security",
  },
  {
    accent: "signal-gold",
    description:
      "Operational skills for CI, issue triage, release hygiene, and the less glamorous parts of shipping.",
    hero: "The glue code and operational muscle memory that keeps the rest of the machine from face-planting.",
    icon: "settings",
    keywords: [
      "ops",
      "github",
      "linear",
      "automation",
      "maintenance",
      "workflow",
    ],
    slug: "ops",
    sources: [
      s(
        "github-blog",
        "GitHub Blog",
        "https://github.blog/feed/",
        "rss",
        ["github", "features", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["github", "copilot", "actions", "security"],
          trust: "official",
        }
      ),
      s(
        "github-changelog",
        "GitHub Changelog",
        "https://github.blog/changelog/feed/",
        "rss",
        ["github", "changelog", "api"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["api", "actions", "packages", "codespaces"],
          trust: "official",
        }
      ),
      s(
        "linear-changelog",
        "Linear Changelog",
        "https://linear.app/changelog",
        "docs",
        ["linear", "issues", "workflow"],
        {
          mode: "discover",
          parser: "html-links",
          searchQueries: ["linear", "issues", "projects", "triage", "cycles"],
          trust: "official",
        }
      ),
      s(
        "sentry-blog",
        "Sentry Blog",
        "https://blog.sentry.io/feed.xml",
        "rss",
        ["sentry", "errors", "observability"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["sentry", "error tracking", "performance", "tracing"],
          trust: "official",
        }
      ),
      s(
        "gitlab-blog",
        "GitLab Blog",
        "https://about.gitlab.com/atom.xml",
        "atom",
        ["gitlab", "ci-cd", "devops"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["gitlab", "ci", "pipeline", "devops"],
          trust: "official",
        }
      ),
      s(
        "github-actions-runner",
        "Actions Runner Releases",
        "https://github.com/actions/runner/releases.atom",
        "atom",
        ["github-actions", "ci", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["actions runner", "ci", "workflow"],
          trust: "official",
        }
      ),
      s(
        "turborepo-releases",
        "Turborepo Releases",
        "https://github.com/vercel/turborepo/releases.atom",
        "atom",
        ["turborepo", "monorepo", "builds"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["turborepo", "monorepo", "cache", "tasks"],
          trust: "official",
        }
      ),
      s(
        "pnpm-releases",
        "pnpm Releases",
        "https://github.com/pnpm/pnpm/releases.atom",
        "atom",
        ["pnpm", "packages", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["pnpm", "workspace", "lockfile"],
          trust: "official",
        }
      ),
      s(
        "eslint-releases",
        "ESLint Releases",
        "https://github.com/eslint/eslint/releases.atom",
        "atom",
        ["eslint", "linting", "releases"],
        {
          mode: "track",
          parser: "feed",
          searchQueries: ["eslint", "flat config", "rules"],
          trust: "official",
        }
      ),
      s(
        "datadog-blog",
        "Datadog Blog",
        "https://www.datadoghq.com/blog/feed/",
        "rss",
        ["datadog", "monitoring", "apm"],
        {
          mode: "discover",
          parser: "feed",
          searchQueries: ["datadog", "apm", "monitoring", "logs"],
          trust: "vendor",
        }
      ),
    ],
    status: "live",
    strapline:
      "GitHub, Linear, maintenance automation, and internal workflow glue.",
    title: "Ops",
  },
];

export const FEATURED_SKILLS = new Set([
  "frontend-frontier",
  "seo-geo",
  "social-content-os",
  "social-draft",
  "security-best-practices",
  "security-threat-model",
  "gh-fix-ci",
  "linear",
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
    accent: "signal-red",
    category: "frontend",
    tags: ["featured", "editorial-ui", "motion"],
    visibility: "public",
  },
  "gh-fix-ci": {
    accent: "signal-gold",
    category: "ops",
    tags: ["ci", "github"],
    visibility: "member",
  },
  linear: {
    accent: "signal-gold",
    category: "ops",
    tags: ["workflow", "issues"],
    visibility: "member",
  },
  "security-best-practices": {
    accent: "signal-blue",
    category: "security",
    tags: ["hardening", "review"],
    visibility: "member",
  },
  "security-threat-model": {
    accent: "signal-blue",
    category: "security",
    tags: ["threat-model", "appsec"],
    visibility: "member",
  },
  "seo-geo": {
    accent: "signal-blue",
    category: "seo-geo",
    tags: ["featured", "citability", "schema"],
    visibility: "public",
  },
  "social-content-os": {
    accent: "signal-gold",
    category: "social",
    tags: ["content", "distribution"],
    visibility: "public",
  },
  "social-draft": {
    accent: "signal-gold",
    category: "social",
    tags: ["drafting", "copy"],
    visibility: "public",
  },
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    ctaLabel: "Reading now",
    description:
      "Browse the catalog, create up to 10 skills, and explore the Sandbox.",
    features: [
      "Up to 10 skills",
      "Up to 3 automations",
      "Catalog access",
      "Sandbox",
    ],
    interval: "forever",
    priceLabel: "$0",
    slug: "free",
    title: "Free",
  },
  {
    ctaLabel: "Unlock operator tools",
    description:
      "Up to 10 skills, AI automations, custom imports, marketplace pricing, and payouts.",
    features: [
      "Up to 10 skills",
      "Unlimited automations",
      "Model selection",
      "Custom import sources",
      "Marketplace pricing & payouts",
    ],
    interval: "per month",
    priceLabel: "$19",
    slug: "operator",
    title: "Operator",
  },
];
