import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { McpDetailPage } from "@/components/mcp-detail-page";
import { getMcpRecordByName } from "@/lib/content";
import { parseVersionSegment } from "@/lib/format";
import { buildMcpMetadata } from "@/lib/seo";
import { getUsageTimeZoneFromCookie } from "@/lib/server/usage-timezone-cookie";

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

  const [mcp, timeZone] = await Promise.all([
    getMcpRecordByName(decodedName, versionNumber),
    getUsageTimeZoneFromCookie(),
  ]);

  if (!mcp) {
    notFound();
  }

  return <McpDetailPage mcp={mcp} timeZone={timeZone} />;
}
