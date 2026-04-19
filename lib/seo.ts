import type { Metadata } from "next";

import { buildMcpVersionHref } from "@/lib/format";
import { CATEGORY_REGISTRY } from "@/lib/registry";
import type { ImportedMcpDocument, SkillRecord } from "@/lib/types";

export const SITE_NAME = "Loop";

export const SEO_DEFAULT_TITLE = "Loop \u2014 Skills that never go stale";

export const SEO_DEFAULT_DESCRIPTION =
  "Loop turns your agent playbooks, updates, and source scans into a living operator desk that stays current.";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const DEFAULT_OG_IMAGE_PATH = "/og.png";
export const LOGO_ICON_PATH = "/icon.svg";

export const TWITTER_SITE_HANDLE = "@kevskgs";
export const TWITTER_CREATOR_HANDLE = "@kevskgs";

/**
 * Public site origin with no trailing slash.
 * Checks NEXT_PUBLIC_SITE_URL, then Vercel-provided env vars, then localhost.
 */
export function getSiteUrlString(): string {
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

function normalizeAppPath(path: string): string {
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  const segments = withLeading.split("/").filter(Boolean);
  return `/${segments.map((s) => encodeURIComponent(decodeURIComponent(s))).join("/")}`;
}

export function buildSiteUrl(path?: string): URL {
  const base = getSiteUrlString();
  const normalized = path && path !== "/" ? normalizeAppPath(path) : "/";
  return new URL(normalized, `${base}/`);
}

export function buildOgImageUrl(params?: {
  title?: string;
  description?: string;
  category?: string;
}): string {
  if (!params?.title && !params?.description && !params?.category) {
    return DEFAULT_OG_IMAGE_PATH;
  }
  const url = new URL(DEFAULT_OG_IMAGE_PATH, "https://n");
  if (params?.title) {
    url.searchParams.set("title", params.title);
  }
  if (params?.description) {
    url.searchParams.set("description", params.description);
  }
  if (params?.category) {
    url.searchParams.set("category", params.category);
  }
  return `${url.pathname}${url.search}`;
}

export function buildDefaultOpenGraphImages(): NonNullable<
  Metadata["openGraph"]
>["images"] {
  return [
    {
      alt: `${SITE_NAME} \u2014 operator desk for self-updating agent skills`,
      height: OG_HEIGHT,
      type: "image/png",
      url: DEFAULT_OG_IMAGE_PATH,
      width: OG_WIDTH,
    },
  ];
}

interface TwitterImageDescriptor {
  url: string;
  alt: string;
  width: number;
  height: number;
  type: string;
}

export function buildDefaultTwitterImages(): TwitterImageDescriptor[] {
  return [
    {
      alt: `${SITE_NAME} \u2014 operator desk for self-updating agent skills`,
      height: OG_HEIGHT,
      type: "image/png",
      url: DEFAULT_OG_IMAGE_PATH,
      width: OG_WIDTH,
    },
  ];
}

/**
 * @deprecated Twitter renders the large image card more reliably when image
 * width/height/type are emitted. Prefer {@link buildDefaultTwitterImages}.
 */
export function buildDefaultTwitterImageUrls(): string[] {
  return [DEFAULT_OG_IMAGE_PATH];
}

export function buildRootKeywords(): string[] {
  const fromCategories = CATEGORY_REGISTRY.flatMap((c) => c.keywords);
  const fixed = [
    "AI agents",
    "agent skills",
    "MCP",
    "Model Context Protocol",
    "playbooks",
    "automation",
    "operator desk",
  ];
  return [...new Set([...fromCategories, ...fixed])];
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  const out = { ...value };
  for (const key of Object.keys(out)) {
    if (out[key as keyof T] === undefined) {
      delete out[key as keyof T];
    }
  }
  return out;
}

export function buildSkillMetadata(skill: SkillRecord): Metadata {
  const canonical = buildSiteUrl(skill.href).toString();
  const title = `${skill.title} · ${SITE_NAME}`;
  const description = (
    skill.excerpt?.trim() ||
    skill.description?.trim() ||
    SEO_DEFAULT_DESCRIPTION
  ).slice(0, 320);
  const indexable = skill.visibility === "public";

  const ogImageUrl = buildOgImageUrl({
    category: skill.category,
    description,
    title: skill.title,
  });
  const ogImages = [
    {
      alt: skill.title,
      height: OG_HEIGHT,
      type: "image/png",
      url: ogImageUrl,
      width: OG_WIDTH,
    },
  ];

  return {
    alternates: { canonical },
    description,
    keywords: [...new Set([skill.category, ...skill.tags].filter(Boolean))],
    openGraph: {
      description,
      images: ogImages,
      siteName: SITE_NAME,
      title,
      type: "article",
      url: canonical,
    },
    robots: indexable ? undefined : { follow: false, index: false },
    title,
    twitter: {
      card: "summary_large_image",
      creator: TWITTER_CREATOR_HANDLE,
      description,
      images: [
        {
          alt: skill.title,
          height: OG_HEIGHT,
          type: "image/png",
          url: ogImageUrl,
          width: OG_WIDTH,
        },
      ],
      site: TWITTER_SITE_HANDLE,
      title,
    },
  };
}

export function buildMcpMetadata(mcp: ImportedMcpDocument): Metadata {
  const canonical = buildSiteUrl(
    buildMcpVersionHref(mcp.name, mcp.version)
  ).toString();
  const title = `${mcp.name} · ${SITE_NAME}`;
  const description = (
    mcp.description?.trim() || SEO_DEFAULT_DESCRIPTION
  ).slice(0, 320);

  const ogImageUrl = buildOgImageUrl({
    category: "MCP",
    description,
    title: mcp.name,
  });
  const ogImages = [
    {
      alt: mcp.name,
      height: OG_HEIGHT,
      type: "image/png",
      url: ogImageUrl,
      width: OG_WIDTH,
    },
  ];

  return {
    alternates: { canonical },
    description,
    keywords: [
      ...new Set(
        ["MCP", "Model Context Protocol", ...mcp.tags].filter(Boolean)
      ),
    ],
    openGraph: {
      description,
      images: ogImages,
      siteName: SITE_NAME,
      title,
      type: "article",
      url: canonical,
    },
    title,
    twitter: {
      card: "summary_large_image",
      creator: TWITTER_CREATOR_HANDLE,
      description,
      images: [
        {
          alt: mcp.name,
          height: OG_HEIGHT,
          type: "image/png",
          url: ogImageUrl,
          width: OG_WIDTH,
        },
      ],
      site: TWITTER_SITE_HANDLE,
      title,
    },
  };
}

export function buildSkillJsonLd(skill: SkillRecord): Record<string, unknown> {
  return stripUndefined({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "DeveloperApplication",
    description: skill.description || skill.excerpt || SEO_DEFAULT_DESCRIPTION,
    keywords: skill.tags.join(", "),
    name: skill.title,
    offers: skill.price
      ? {
          "@type": "Offer",
          price: skill.price.amount,
          priceCurrency: skill.price.currency,
        }
      : undefined,
    operatingSystem: "Any",
    url: buildSiteUrl(skill.href).toString(),
  });
}

export function buildMcpJsonLd(
  mcp: ImportedMcpDocument
): Record<string, unknown> {
  return stripUndefined({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Model Context Protocol server",
    description: mcp.description || SEO_DEFAULT_DESCRIPTION,
    keywords: mcp.tags.join(", "),
    name: mcp.name,
    operatingSystem: "Any",
    url: buildSiteUrl(buildMcpVersionHref(mcp.name, mcp.version)).toString(),
  });
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    description: SEO_DEFAULT_DESCRIPTION,
    logo: buildSiteUrl(LOGO_ICON_PATH).toString(),
    name: SITE_NAME,
    url: buildSiteUrl("/").toString(),
  };
}
