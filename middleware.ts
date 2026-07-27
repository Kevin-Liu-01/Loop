import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isLibraryPath, PUBLIC_HOME_PATH } from "@/lib/navigation";

// Per-route auth (`requireAuth()` inside each handler) covers every
// /api/skills/** mutation endpoint, so the previous "/api/skills(.*)" matcher
// was both redundant and harmful — it 404'd the public reads at
// /api/skills/[slug]/raw and /api/skills/raw/all that are documented in
// llms.txt and the FAQ. Keep middleware-level protection only for routes
// without per-handler enforcement.
const isProtectedRoute = createRouteMatcher([
  "/signed-in(.*)",
  "/settings(.*)",
  "/sandbox(.*)",
  "/api/automations(.*)",
  "/api/billing(.*)",
  "/api/connect(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isLibraryPath(req.nextUrl.pathname)) {
    try {
      const { userId } = await auth();
      if (userId) {
        return;
      }
    } catch {
      // Auth configuration or bot requests should fail closed to the public
      // home instead of turning the library entry point into a 500 response.
    }

    return NextResponse.redirect(new URL(PUBLIC_HOME_PATH, req.url));
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const middleware = clerkHandler;

export const config = {
  matcher: [
    "/",
    "/signed-in/:path*",
    "/settings/:path*",
    "/sandbox/:path*",
    "/api/:path*",
  ],
};
