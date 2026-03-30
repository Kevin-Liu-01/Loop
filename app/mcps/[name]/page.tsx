import { notFound, redirect } from "next/navigation";

import { getMcpRecordByName } from "@/lib/content";
import { buildMcpVersionHref } from "@/lib/format";

type McpNamePageProps = {
  params: Promise<{ name: string }>;
};

export default async function McpNamePage({ params }: McpNamePageProps) {
  const { name } = await params;
  const mcp = await getMcpRecordByName(decodeURIComponent(name));

  if (!mcp) {
    notFound();
  }

  redirect(buildMcpVersionHref(mcp.name, mcp.version));
}
