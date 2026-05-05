import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import {
  buildBotResponse,
  isSocialBot,
  shouldServeBotHtml,
} from "@/lib/social-bot-html";

// Per-route auth (`requireAuth()` inside each handler) covers every
// /api/skills/** mutation endpoint, so the previous "/api/skills(.*)" matcher
// was both redundant and harmful — it 404'd the public reads at
// /api/skills/[slug]/raw and /api/skills/raw/all that are documented in
// llms.txt and the FAQ. Keep middleware-level protection only for routes
// without per-handler enforcement.
const isProtectedRoute = createRouteMatcher([
  "/settings(.*)",
  "/api/automations(.*)",
  "/api/billing(.*)",
  "/api/connect(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export async function middleware(req: NextRequest, event: NextFetchEvent) {
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
