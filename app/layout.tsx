import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ui } from "@clerk/ui";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";

import { ActiveOperationsProvider } from "@/components/active-operations-provider";
import { CommandPalette } from "@/components/command-palette";
import { NewAutomationModal } from "@/components/new-automation-modal";
import { NewSkillModal } from "@/components/new-skill-modal";
import { OperatorProvider } from "@/components/operator-provider";
import { SeoJsonLd } from "@/components/seo-json-ld";
import { TimezoneProvider } from "@/components/timezone-provider";
import { TooltipProvider } from "@/components/ui/shadcn/tooltip";
import { WelcomeModal } from "@/components/welcome-modal";

import "@/app/globals.css";
import { isAdminEmail } from "@/lib/admin";
import { getUserSubscription } from "@/lib/auth";
import { clerkAppearance } from "@/lib/clerk-theme";
import { buildMcpVersionHref } from "@/lib/format";
import { getLoopSnapshot } from "@/lib/refresh";
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
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";

export const metadata: Metadata = {
  alternates: {
    canonical: buildSiteUrl("/").toString(),
  },
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
    url: buildSiteUrl("/").toString(),
  },
  title: {
    default: SEO_DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    creator: TWITTER_CREATOR_HANDLE,
    description: SEO_DEFAULT_DESCRIPTION,
    images: buildDefaultTwitterImages(),
    site: TWITTER_SITE_HANDLE,
    title: SEO_DEFAULT_TITLE,
  },
};

async function DeferredGlobals() {
  let paletteItems: {
    label: string;
    href: string;
    section: string;
    hint: string;
  }[] = [];
  let snapshotCategories: Awaited<
    ReturnType<typeof getLoopSnapshot>
  >["categories"] = [];
  let snapshotSkills: Awaited<ReturnType<typeof getLoopSnapshot>>["skills"] =
    [];

  try {
    const snapshot = await getLoopSnapshot();
    snapshotCategories = snapshot.categories;
    snapshotSkills = snapshot.skills;

    paletteItems = [
      ...snapshot.skills.slice(0, 30).map((skill) => ({
        hint: skill.versionLabel,
        href: skill.href,
        label: skill.title,
        section: "Skill",
      })),
      ...snapshot.categories.map((category) => ({
        hint: category.status === "live" ? "Live" : "Seeded",
        href: `/?category=${category.slug}`,
        label: category.title,
        section: "Category",
      })),
      {
        hint: "Agent environment",
        href: "/sandbox",
        label: "Sandbox",
        section: "Action",
      },
      {
        hint: "Ops",
        href: "/settings",
        label: "Settings",
        section: "Action",
      },
      ...snapshot.mcps.slice(0, 20).map((mcp) => ({
        hint: mcp.transport,
        href: buildMcpVersionHref(mcp.name, mcp.version),
        label: mcp.name,
        section: "MCP",
      })),
    ];
  } catch {
    // Gracefully degrade when env vars are unavailable (e.g. landing pages)
  }

  return (
    <>
      <CommandPalette items={paletteItems} />
      <NewSkillModal categories={snapshotCategories} />
      <NewAutomationModal skills={snapshotSkills} />
      <WelcomeModal />
    </>
  );
}

async function resolveOperatorStatus(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) {
      return false;
    }
    const email = user.emailAddresses[0]?.emailAddress ?? "";
    if (isAdminEmail(email)) {
      return true;
    }
    const subscription = await getUserSubscription(user.id);
    return subscription !== null;
  } catch {
    return false;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [serverTimeZone, isOperator] = await Promise.all([
    getUsageTimeZoneFromCookie(),
    resolveOperatorStatus(),
  ]);

  return (
    <ClerkProvider appearance={clerkAppearance} ui={ui}>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <SeoJsonLd data={buildOrganizationJsonLd()} />
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <OperatorProvider isOperator={isOperator}>
              <TimezoneProvider serverTimeZone={serverTimeZone}>
                <TooltipProvider delayDuration={300}>
                  <ActiveOperationsProvider>
                    <Suspense>
                      <DeferredGlobals />
                    </Suspense>
                    {children}
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
