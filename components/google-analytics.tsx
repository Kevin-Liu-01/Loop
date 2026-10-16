"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

import {
  GA_MEASUREMENT_ID,
  isAnalyticsPath,
  syncAnalyticsOptOut,
} from "@/lib/analytics";

// Consent Mode v2 defaults are queued before gtag.js loads: no ad storage
// anywhere, and EEA/UK/CH visitors are measured without analytics cookies.
const GA_BOOTSTRAP = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','CH','GB']});
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`;

/**
 * GA4 for public pages; the root layout renders it on production deploys only.
 * Signed-in routes never load gtag.js, and the opt-out flag (also set by
 * instrumentation-client.ts before the URL changes) silences it after a client
 * navigation into them. GA4 enhanced measurement counts SPA page views.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    syncAnalyticsOptOut(pathname);
  }, [pathname]);

  if (!isAnalyticsPath(pathname)) {
    return null;
  }

  return (
    <>
      <Script id="ga-bootstrap" strategy="afterInteractive">
        {GA_BOOTSTRAP}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
