import { syncAnalyticsOptOut } from "@/lib/analytics";

// Next calls this before a client navigation changes the URL, so the GA
// opt-out for signed-in routes is set before gtag's history listener fires.
export function onRouterTransitionStart(url: string): void {
  syncAnalyticsOptOut(new URL(url, window.location.href).pathname);
}
