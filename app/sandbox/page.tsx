import type { Metadata } from "next";
import { Suspense } from "react";

import { AppGridShell } from "@/components/app-grid-shell";
import { SandboxShell } from "@/components/sandbox-shell";
import { SiteHeader } from "@/components/site-header";
import { LoadingStatusPill } from "@/components/ui/loading-status-pill";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { UsageBeacon } from "@/components/usage-beacon";
import { AGENT_PROVIDER_PRESETS } from "@/lib/agents";
import { supportsSandboxMcp } from "@/lib/mcp-utils";
import { getSystemSnapshot } from "@/lib/system-summary";

export const metadata: Metadata = {
  description:
    "Run agents against skills and MCPs in an interactive sandbox environment.",
  robots: { follow: false, index: false },
  title: "Sandbox",
};

interface SandboxPageProps {
  searchParams: Promise<{ skill?: string; mcp?: string; mcpId?: string }>;
}

export const dynamic = "force-dynamic";

export default function SandboxPage({ searchParams }: SandboxPageProps) {
  return (
    <AppGridShell fillViewport header={<SiteHeader />}>
      <PageShell inset className="flex min-h-0 min-w-0 flex-1 flex-col">
        <UsageBeacon
          dedupeKey="page:/sandbox"
          kind="page_view"
          label="Opened sandbox"
          path="/sandbox"
        />
        <Suspense fallback={<SandboxFallback />}>
          <SandboxData searchParams={searchParams} />
        </Suspense>
      </PageShell>
    </AppGridShell>
  );
}

async function SandboxData({ searchParams }: SandboxPageProps) {
  const [{ snapshot }, params] = await Promise.all([
    getSystemSnapshot(),
    searchParams,
  ]);

  const initialMcpId =
    params.mcpId ??
    snapshot.mcps.find((mcp) => {
      if (params.mcp === undefined) {
        return false;
      }
      return (
        supportsSandboxMcp(mcp) &&
        (mcp.id === params.mcp ||
          mcp.slug === params.mcp ||
          mcp.name === params.mcp)
      );
    })?.id;

  return (
    <SandboxShell
      initialSkillSlug={params.skill}
      initialMcpId={initialMcpId}
      mcps={snapshot.mcps}
      presets={AGENT_PROVIDER_PRESETS}
      skills={snapshot.skills}
    />
  );
}

function SandboxFallback() {
  return (
    <>
      <div className="flex min-h-0 flex-1 gap-0">
        <div className="flex w-72 shrink-0 flex-col gap-3 border-r border-line p-4 max-lg:hidden">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-3/5" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-4 h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <LoadingStatusPill label="Booting sandbox" />
    </>
  );
}
