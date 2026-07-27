import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { ActiveOperationsProvider } from "@/components/active-operations-provider";
import { FeedbackWidget } from "@/components/feedback-widget";
import { MotionProvider } from "@/components/motion-provider";
import { OperatorProvider } from "@/components/operator-provider";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { TimezoneProvider } from "@/components/timezone-provider";
import { TooltipProvider } from "@/components/ui/shadcn/tooltip";

import "@/app/globals.css";
import "lenis/dist/lenis.css";
import { clerkAppearance } from "@/lib/clerk-theme";
import { LIBRARY_PATH, PUBLIC_HOME_PATH } from "@/lib/navigation";
import {
  buildDefaultOpenGraphImages,
  buildDefaultTwitterImages,
  buildOrganizationJsonLd,
  buildRootKeywords,
  buildSiteUrl,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  SITE_NAME,
  TWITTER_CREATOR_HANDLE,
  TWITTER_SITE_HANDLE,
} from "@/lib/seo";

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  description: SEO_DEFAULT_DESCRIPTION,
  keywords: buildRootKeywords(),
  metadataBase: buildSiteUrl(),
  openGraph: {
    description: SEO_DEFAULT_DESCRIPTION,
    images: buildDefaultOpenGraphImages(),
    locale: "en_US",
    siteName: SITE_NAME,
    title: SEO_DEFAULT_TITLE,
    type: "website",
    url: buildSiteUrl(PUBLIC_HOME_PATH).toString(),
  },
  title: {
    default: SEO_DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    creator: TWITTER_CREATOR_HANDLE,
    description: SEO_DEFAULT_DESCRIPTION,
    images: buildDefaultTwitterImages(),
    site: TWITTER_SITE_HANDLE,
    title: SEO_DEFAULT_TITLE,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl={PUBLIC_HOME_PATH}
      appearance={clerkAppearance}
      signInFallbackRedirectUrl={LIBRARY_PATH}
      signUpFallbackRedirectUrl={LIBRARY_PATH}
      ui={ui}
    >
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <SeoJsonLd data={buildOrganizationJsonLd()} />
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <OperatorProvider isOperator={false}>
              <TimezoneProvider serverTimeZone="UTC">
                <TooltipProvider delayDuration={300}>
                  <ActiveOperationsProvider>
                    <MotionProvider>{children}</MotionProvider>
                    <FeedbackWidget />
                  </ActiveOperationsProvider>
                </TooltipProvider>
              </TimezoneProvider>
            </OperatorProvider>
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
