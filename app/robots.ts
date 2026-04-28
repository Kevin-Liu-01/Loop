import type { MetadataRoute } from "next";

import { buildSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { allow: "/", userAgent: "*" },
      { allow: "/", userAgent: "GPTBot" },
      { allow: "/", userAgent: "ChatGPT-User" },
      { allow: "/", userAgent: "Google-Extended" },
      { allow: "/", userAgent: "ClaudeBot" },
      { allow: "/", userAgent: "anthropic-ai" },
      { allow: "/", userAgent: "PerplexityBot" },
      { allow: "/", userAgent: "Googlebot" },
      { allow: "/", userAgent: "Bingbot" },
    ],
    sitemap: buildSiteUrl("/sitemap.xml").toString(),
  };
}
