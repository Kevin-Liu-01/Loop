import type { NextFetchEvent, NextRequest } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import {
  buildBotResponse,
  isSocialBot,
  shouldServeBotHtml,
} from "@/lib/social-bot-html";

const isProtectedRoute = createRouteMatcher([
  "/settings(.*)",
  "/api/skills(.*)",
  "/api/automations(.*)",
  "/api/billing(.*)",
  "/api/connect(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export async function proxy(req: NextRequest, event: NextFetchEvent) {
  if (isSocialBot(req) && shouldServeBotHtml(req.nextUrl.pathname)) {
    return buildBotResponse(req);
  }
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|og|sitemap\\.xml|robots\\.txt|feed\\.xml|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
