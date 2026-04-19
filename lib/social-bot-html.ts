import type { NextRequest } from "next/server";

const SITE_NAME = "Loop";
const DEFAULT_TITLE = "Loop \u2014 Skills that never go stale";
const DEFAULT_DESCRIPTION =
  "Loop turns your agent playbooks, updates, and source scans into a living operator desk that stays current.";
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
// Twitter caches per absolute URL. The previous "/og" path was extensionless
// and got cached as "no preview"; using "/og.png" busts that cache and reads
// more reliably as an image to strict scrapers.
const STATIC_OG_IMAGE_PATH = "/og.png";
const TWITTER_SITE_HANDLE = "@kevskgs";
const TWITTER_CREATOR_HANDLE = "@kevskgs";

export const SOCIAL_BOT_RE =
  /Twitterbot|facebookexternalhit|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Applebot|Pinterestbot/i;

const BOT_BYPASS_PREFIXES = ["/api/", "/trpc/", "/sign-in", "/sign-up"];

export function isSocialBot(req: NextRequest): boolean {
  return SOCIAL_BOT_RE.test(req.headers.get("user-agent") ?? "");
}

export function shouldServeBotHtml(pathname: string): boolean {
  return !BOT_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

interface PageMeta {
  title: string;
  description: string;
  ogImagePath: string;
  ogImageAlt: string;
  ogType: string;
  canonicalPath: string;
}

function slugToTitle(slug: string): string {
  return decodeURIComponent(slug)
    .replaceAll("-", " ")
    .replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

function resolvePageMeta(pathname: string): PageMeta {
  const skillMatch = pathname.match(/^\/skills\/([^/]+)(?:\/[^/]+)?$/);
  if (skillMatch) {
    const name = slugToTitle(skillMatch[1]);
    return {
      canonicalPath: pathname,
      description: `Skill details for ${name} on ${SITE_NAME}.`,
      ogImageAlt: name,
      ogImagePath: `/og.png?title=${encodeURIComponent(name)}&category=Skill`,
      ogType: "article",
      title: `${name} · ${SITE_NAME}`,
    };
  }

  const mcpMatch = pathname.match(/^\/mcps\/([^/]+)(?:\/[^/]+)?$/);
  if (mcpMatch) {
    const name = decodeURIComponent(mcpMatch[1]);
    return {
      canonicalPath: pathname,
      description: `MCP server details for ${name} on ${SITE_NAME}.`,
      ogImageAlt: name,
      ogImagePath: `/og.png?title=${encodeURIComponent(name)}&category=MCP`,
      ogType: "article",
      title: `${name} · ${SITE_NAME}`,
    };
  }

  if (pathname === "/faq") {
    return {
      canonicalPath: "/faq",
      description: DEFAULT_DESCRIPTION,
      ogImageAlt: `${SITE_NAME} \u2014 operator desk for self-updating agent skills`,
      ogImagePath: STATIC_OG_IMAGE_PATH,
      ogType: "website",
      title: `FAQ · ${SITE_NAME}`,
    };
  }

  return {
    canonicalPath: "/",
    description: DEFAULT_DESCRIPTION,
    ogImageAlt: `${SITE_NAME} \u2014 operator desk for self-updating agent skills`,
    ogImagePath: STATIC_OG_IMAGE_PATH,
    ogType: "website",
    title: DEFAULT_TITLE,
  };
}

function getSiteOrigin(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];
  for (const raw of candidates) {
    const trimmed = raw?.trim();
    if (trimmed) {
      return trimmed.replace(/\/+$/, "");
    }
  }
  return "http://localhost:3000";
}

export function buildBotResponse(req: NextRequest): Response {
  const origin = getSiteOrigin();
  const meta = resolvePageMeta(req.nextUrl.pathname);
  const image = `${origin}${meta.ogImagePath}`;
  const url = `${origin}${meta.canonicalPath}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}" />
<meta property="og:title" content="${esc(meta.title)}" />
<meta property="og:description" content="${esc(meta.description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="${OG_WIDTH}" />
<meta property="og:image:height" content="${OG_HEIGHT}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:alt" content="${esc(meta.ogImageAlt)}" />
<meta property="og:type" content="${meta.ogType}" />
<meta property="og:site_name" content="${esc(SITE_NAME)}" />
<meta property="og:locale" content="en_US" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="${TWITTER_SITE_HANDLE}" />
<meta name="twitter:creator" content="${TWITTER_CREATOR_HANDLE}" />
<meta name="twitter:title" content="${esc(meta.title)}" />
<meta name="twitter:description" content="${esc(meta.description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<meta name="twitter:image:alt" content="${esc(meta.ogImageAlt)}" />
<meta name="twitter:image:type" content="image/png" />
<meta name="twitter:image:width" content="${OG_WIDTH}" />
<meta name="twitter:image:height" content="${OG_HEIGHT}" />
<link rel="icon" href="/icon.svg" />
</head>
<body></body>
</html>`;

  const body = new TextEncoder().encode(html);

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Content-Length": String(body.byteLength),
      "Content-Type": "text/html; charset=utf-8",
      Vary: "User-Agent",
    },
    status: 200,
  });
}

function esc(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
