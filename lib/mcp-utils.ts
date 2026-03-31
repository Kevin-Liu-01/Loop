import type { ImportedMcpDocument, ImportedMcpTransport } from "@/lib/types";

export function supportsExecutableMcpTransport(transport: ImportedMcpTransport): boolean {
  return transport === "stdio" || transport === "http";
}

export function supportsSandboxMcp(
  mcp: Pick<ImportedMcpDocument, "transport" | "sandboxSupported">,
): boolean {
  return mcp.sandboxSupported ?? supportsExecutableMcpTransport(mcp.transport);
}
