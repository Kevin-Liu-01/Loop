import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { buildRootBotResponse, isSocialBot } from "@/lib/social-bot-html";

const isProtectedRoute = createRouteMatcher([
  "/settings(.*)",
  "/api/skills(.*)",
  "/api/automations(.*)",
  "/api/billing(.*)",
  "/api/connect(.*)"
]);

const BOT_ELIGIBLE_PATHS = new Set(["/"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (isSocialBot(req) && BOT_ELIGIBLE_PATHS.has(req.nextUrl.pathname)) {
    return buildRootBotResponse();
  }

  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|og|sitemap\\.xml|robots\\.txt|feed\\.xml|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};
