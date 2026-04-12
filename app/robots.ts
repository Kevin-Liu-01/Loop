import type { MetadataRoute } from "next";

import { buildSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { allow: "/", userAgent: "*" },
    sitemap: buildSiteUrl("/sitemap.xml").toString(),
  };
}
