import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Per-route auth (`requireAuth()` inside each handler) covers every
// /api/skills/** mutation endpoint, so the previous "/api/skills(.*)" matcher
// was both redundant and harmful — it 404'd the public reads at
// /api/skills/[slug]/raw and /api/skills/raw/all that are documented in
// llms.txt and the FAQ. Keep middleware-level protection only for routes
// without per-handler enforcement.
const isProtectedRoute = createRouteMatcher([
  "/home(.*)",
  "/signed-in(.*)",
  "/settings(.*)",
  "/sandbox(.*)",
  "/api/automations(.*)",
  "/api/billing(.*)",
  "/api/connect(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const middleware = clerkHandler;

export const config = {
  matcher: [
    "/home/:path*",
    "/signed-in/:path*",
    "/settings/:path*",
    "/sandbox/:path*",
    "/api/:path*",
  ],
};
