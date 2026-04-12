import type { Metadata } from "next";

import { AppGridShell } from "@/components/app-grid-shell";
import { SettingsShell } from "@/components/settings-shell";
import { SiteHeader } from "@/components/site-header";
import { PageShell } from "@/components/ui/page-shell";
import { UsageBeacon } from "@/components/usage-beacon";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Settings",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppGridShell header={<SiteHeader />}>
      <UsageBeacon
        dedupeKey="page:/settings"
        kind="page_view"
        label="Opened settings"
        path="/settings"
      />

      <PageShell inset narrow className="flex min-h-0 flex-1 flex-col">
        <SettingsShell>{children}</SettingsShell>
      </PageShell>
    </AppGridShell>
  );
}
