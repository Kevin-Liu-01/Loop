import type { MetadataRoute } from "next";

import { SEO_DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0a0a09",
    description: SEO_DEFAULT_DESCRIPTION,
    display: "standalone",
    icons: [
      {
        sizes: "any",
        src: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    name: `${SITE_NAME} – Operator Desk`,
    short_name: SITE_NAME,
    start_url: "/",
    theme_color: "#0a0a09",
  };
}
