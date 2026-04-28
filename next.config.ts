import type { NextConfig } from "next";

const SOCIAL_AND_SEO_BOTS =
  /Googlebot|GoogleOther|Google-Extended|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Twitterbot|facebookexternalhit|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Applebot|Pinterestbot|Bingbot|YandexBot|GPTBot|ChatGPT-User|ClaudeBot|anthropic-ai|PerplexityBot|Bytespider|CCBot|cohere-ai/;

const nextConfig: NextConfig = {
  experimental: {
    // Keep prefetched loading.tsx shells cached longer so returning to a
    // recently-hovered route paints the skeleton instantly instead of
    // re-requesting it. Dynamic routes default to 0s (no reuse); bumping
    // this improves perceived nav speed. Kept low enough that auth-state
    // changes (sign-out) don't serve stale pages for too long.
    staleTimes: {
      dynamic: 15,
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
