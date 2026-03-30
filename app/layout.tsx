import type { Metadata } from "next";

import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { CommandPalette } from "@/components/command-palette";
import { NewSkillModal } from "@/components/new-skill-modal";
import "@/app/globals.css";
import { getLoopSnapshot } from "@/lib/refresh";
import { THEME_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Loop",
  description:
    "Loop turns your agent playbooks, updates, and source scans into a living operator desk that stays current."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  let paletteItems: { label: string; href: string; section: string; hint: string }[] = [];
  let snapshotCategories: Awaited<ReturnType<typeof getLoopSnapshot>>["categories"] = [];

  try {
    const snapshot = await getLoopSnapshot();
    snapshotCategories = snapshot.categories;

    paletteItems = [
      ...snapshot.skills.slice(0, 30).map((skill) => ({
        label: skill.title,
        href: skill.href,
        section: "Skill",
        hint: skill.versionLabel
      })),
      ...snapshot.categories.map((category) => ({
        label: category.title,
        href: `/?category=${category.slug}`,
        section: "Category",
        hint: category.status === "live" ? "Live" : "Seeded"
      })),
      {
        label: "Sandbox",
        href: "/sandbox",
        section: "Action",
        hint: "Agent environment"
      },
      {
        label: "Settings",
        href: "/settings",
        section: "Action",
        hint: "Ops"
      }
    ];
  } catch {
    // Gracefully degrade when env vars are unavailable (e.g. landing pages)
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <script
            dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
          />
          <CommandPalette items={paletteItems} />
          <NewSkillModal categories={snapshotCategories} />
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
