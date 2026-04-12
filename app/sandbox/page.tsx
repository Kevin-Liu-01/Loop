import type { Metadata } from "next";

import { AppGridShell } from "@/components/app-grid-shell";
import { SandboxShell } from "@/components/sandbox-shell";
import { SiteHeader } from "@/components/site-header";
import { PageShell } from "@/components/ui/page-shell";
import { UsageBeacon } from "@/components/usage-beacon";
import { AGENT_PROVIDER_PRESETS } from "@/lib/agents";
import { supportsSandboxMcp } from "@/lib/mcp-utils";

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

export default async function SandboxPage({ searchParams }: SandboxPageProps) {
  const [{ snapshot }, params] = await Promise.all([
    import("@/lib/system-summary").then((m) => m.getSystemSnapshot()),
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
    <AppGridShell fillViewport header={<SiteHeader />}>
      <PageShell inset className="flex min-h-0 min-w-0 flex-1 flex-col">
        <UsageBeacon
          dedupeKey="page:/sandbox"
          kind="page_view"
          label="Opened sandbox"
          path="/sandbox"
        />
        <SandboxShell
          initialSkillSlug={params.skill}
          initialMcpId={initialMcpId}
          mcps={snapshot.mcps}
          presets={AGENT_PROVIDER_PRESETS}
          skills={snapshot.skills}
        />
      </PageShell>
    </AppGridShell>
  );
}
