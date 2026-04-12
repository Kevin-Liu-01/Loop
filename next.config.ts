import type { NextConfig } from "next";

const SOCIAL_AND_SEO_BOTS =
  /Googlebot|GoogleOther|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Twitterbot|facebookexternalhit|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Applebot|Pinterestbot|Bingbot|YandexBot/;

const nextConfig: NextConfig = {
  htmlLimitedBots: SOCIAL_AND_SEO_BOTS,
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
  async rewrites() {
    return [{ destination: "/og", source: "/og.png" }];
  },
  transpilePackages: ["@chenglou/pretext"],
};

export default nextConfig;
