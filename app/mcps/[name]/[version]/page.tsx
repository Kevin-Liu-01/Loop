import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AppGridShell } from "@/components/app-grid-shell";
import { McpDetailPage } from "@/components/mcp-detail-page";
import { SiteHeader } from "@/components/site-header";
import { LoadingStatusPill } from "@/components/ui/loading-status-pill";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { getMcpRecordByName } from "@/lib/content";
import { parseVersionSegment } from "@/lib/format";
import { buildMcpMetadata } from "@/lib/seo";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";
import { pageInsetPadX } from "@/lib/ui-layout";

interface VersionedMcpPageProps {
  params: Promise<{
    name: string;
    version: string;
  }>;
}

export async function generateMetadata({
  params,
}: VersionedMcpPageProps): Promise<Metadata> {
  const { name, version } = await params;
  const versionNumber = parseVersionSegment(version);
  if (!versionNumber) {
    return {};
  }
  const mcp = await getMcpRecordByName(decodeURIComponent(name), versionNumber);
  if (!mcp) {
    return {};
  }
  return buildMcpMetadata(mcp);
}

export default async function VersionedMcpPage({
  params,
}: VersionedMcpPageProps) {
  const { name, version } = await params;
  const decodedName = decodeURIComponent(name);
  const versionNumber = parseVersionSegment(version);

  if (!versionNumber) {
    notFound();
  }

  return (
    <Suspense fallback={<McpDetailFallback />}>
      <McpDetailData name={decodedName} versionNumber={versionNumber} />
    </Suspense>
  );
}

async function McpDetailData({
  name,
  versionNumber,
}: {
  name: string;
  versionNumber: number;
}) {
  const [mcp, timeZone] = await Promise.all([
    getMcpRecordByName(name, versionNumber),
    getUsageTimeZoneFromCookie(),
  ]);

  if (!mcp) {
    notFound();
  }

  return <McpDetailPage mcp={mcp} timeZone={timeZone} />;
}

function McpDetailFallback() {
  return (
    <AppGridShell header={<SiteHeader />}>
      <PageShell inset className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "grid min-h-0 flex-1 gap-6 overflow-y-auto py-6 sm:py-8",
            pageInsetPadX
          )}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10" />
            <div className="grid gap-1.5">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>

          <div className="grid gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </PageShell>
      <LoadingStatusPill label="Loading MCP" />
    </AppGridShell>
  );
}
