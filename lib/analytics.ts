import { isLibraryPath, SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/navigation";

/** GA4 property for loooop.dev. Measurement IDs are public; this one ships in page HTML. */
export const GA_MEASUREMENT_ID = "G-B6VBCPJMHL";

/**
 * Signed-in surfaces and auth pages never send analytics. The library at "/"
 * is signed-in only too (signed-out visitors are redirected to /home).
 */
const UNTRACKED_PATH_PREFIXES = [
  "/settings",
  "/sandbox",
  "/signed-in",
  SIGN_IN_PATH,
  SIGN_UP_PATH,
] as const;

export function isAnalyticsPath(pathname: string): boolean {
  if (isLibraryPath(pathname)) {
    return false;
  }

  return !UNTRACKED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Sets GA's documented per-property opt-out (`window["ga-disable-<id>"]`) for
 * the route being shown, so client navigations into signed-in routes send no hits.
 */
export function syncAnalyticsOptOut(pathname: string): void {
  Reflect.set(
    window,
    `ga-disable-${GA_MEASUREMENT_ID}`,
    !isAnalyticsPath(pathname)
  );
}
