import type { NextConfig } from "next";

const SOCIAL_AND_SEO_BOTS =
  /Googlebot|GoogleOther|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Twitterbot|facebookexternalhit|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Applebot|Pinterestbot|Bingbot|YandexBot/;

const nextConfig: NextConfig = {
  experimental: {
    // Keep prefetched loading.tsx shells cached longer so returning to a
    // recently-hovered route paints the skeleton instantly instead of
    // re-requesting it. Dynamic routes default to 0s (no reuse); bumping
    // this is the single biggest perceived-speed win for nav.
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
  htmlLimitedBots: SOCIAL_AND_SEO_BOTS,
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
  async rewrites() {
    return [{ destination: "/og", source: "/og.png" }];
  },
  transpilePackages: ["@chenglou/pretext"],
};

export default nextConfig;
