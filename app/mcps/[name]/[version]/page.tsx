import { notFound } from "next/navigation";

import { McpDetailPage } from "@/components/mcp-detail-page";
import { getMcpRecordByName } from "@/lib/content";
import { parseVersionSegment } from "@/lib/format";

type VersionedMcpPageProps = {
  params: Promise<{
    name: string;
    version: string;
  }>;
};

export default async function VersionedMcpPage({ params }: VersionedMcpPageProps) {
  const { name, version } = await params;
  const decodedName = decodeURIComponent(name);
  const versionNumber = parseVersionSegment(version);

  if (!versionNumber) {
    notFound();
  }

  const mcp = await getMcpRecordByName(decodedName, versionNumber);

  if (!mcp) {
    notFound();
  }

  return <McpDetailPage mcp={mcp} />;
}
