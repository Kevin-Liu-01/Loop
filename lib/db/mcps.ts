import { getServerSupabase } from "@/lib/db/client";
import { buildVersionLabel } from "@/lib/format";
import type { ImportedMcpDocument, ImportedMcpVersion } from "@/lib/types";

type McpRow = {
  id: string;
  name: string;
  description: string;
  slug: string | null;
  manifest_url: string;
  homepage_url: string | null;
  docs_url: string | null;
  transport: string;
  url: string | null;
  command: string | null;
  args: string[];
  env_keys: string[];
  headers: unknown;
  tags: string[];
  raw: string;
  version: number;
  version_label: string;
  created_at: string;
  updated_at: string;
  icon_url: string | null;
  package_name: string | null;
  package_registry: string | null;
  install_strategy: string;
  auth_type: string;
  verification_status: string;
  sandbox_supported: boolean;
  sandbox_notes: string;
  normalized_config: unknown;
};

function rowToMcpDocument(row: McpRow, versions?: ImportedMcpVersion[]): ImportedMcpDocument {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    slug: row.slug ?? undefined,
    manifestUrl: row.manifest_url,
    homepageUrl: row.homepage_url ?? undefined,
    docsUrl: row.docs_url ?? undefined,
    transport: row.transport as ImportedMcpDocument["transport"],
    url: row.url ?? undefined,
    command: row.command ?? undefined,
    args: row.args,
    envKeys: row.env_keys,
    headers: (row.headers ?? undefined) as Record<string, string> | undefined,
    tags: row.tags,
    raw: row.raw,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
    versionLabel: row.version_label,
    versions: versions ?? [],
    iconUrl: row.icon_url ?? undefined,
    packageName: row.package_name ?? undefined,
    packageRegistry: row.package_registry ?? undefined,
    installStrategy: row.install_strategy as ImportedMcpDocument["installStrategy"],
    authType: row.auth_type as ImportedMcpDocument["authType"],
    verificationStatus: row.verification_status as ImportedMcpDocument["verificationStatus"],
    sandboxSupported: row.sandbox_supported,
    sandboxNotes: row.sandbox_notes,
    normalizedConfig: (row.normalized_config ?? {}) as Record<string, unknown>
  };
}

function mcpToRow(mcp: ImportedMcpDocument): Record<string, unknown> {
  return {
    id: mcp.id,
    name: mcp.name,
    description: mcp.description,
    slug: mcp.slug ?? null,
    manifest_url: mcp.manifestUrl,
    homepage_url: mcp.homepageUrl ?? null,
    docs_url: mcp.docsUrl ?? null,
    transport: mcp.transport,
    url: mcp.url ?? null,
    command: mcp.command ?? null,
    args: mcp.args,
    env_keys: mcp.envKeys,
    headers: mcp.headers ?? null,
    tags: mcp.tags,
    raw: mcp.raw,
    version: mcp.version,
    version_label: mcp.versionLabel,
    icon_url: mcp.iconUrl ?? null,
    package_name: mcp.packageName ?? null,
    package_registry: mcp.packageRegistry ?? null,
    install_strategy: mcp.installStrategy ?? "manual",
    auth_type: mcp.authType ?? "none",
    verification_status: mcp.verificationStatus ?? "unverified",
    sandbox_supported: mcp.sandboxSupported ?? false,
    sandbox_notes: mcp.sandboxNotes ?? "",
    normalized_config: mcp.normalizedConfig ?? {}
  };
}

type McpVersionRow = {
  mcp_id: string;
  version: number;
  description: string;
  manifest_url: string;
  homepage_url: string | null;
  docs_url: string | null;
  transport: string;
  url: string | null;
  command: string | null;
  args: string[];
  env_keys: string[];
  headers: unknown;
  tags: string[];
  raw: string;
  created_at: string;
  package_name: string | null;
  package_registry: string | null;
  install_strategy: string;
  auth_type: string;
  verification_status: string;
  sandbox_supported: boolean;
  sandbox_notes: string;
  normalized_config: unknown;
};

function parseVersionRows(rows: McpVersionRow[]): ImportedMcpVersion[] {
  return rows.map((v) => ({
    version: v.version,
    updatedAt: v.created_at,
    description: v.description,
    manifestUrl: v.manifest_url,
    homepageUrl: v.homepage_url ?? undefined,
    docsUrl: v.docs_url ?? undefined,
    transport: v.transport as ImportedMcpVersion["transport"],
    url: v.url ?? undefined,
    command: v.command ?? undefined,
    args: v.args,
    envKeys: v.env_keys,
    headers: (v.headers ?? undefined) as Record<string, string> | undefined,
    tags: v.tags,
    raw: v.raw,
    packageName: v.package_name ?? undefined,
    packageRegistry: v.package_registry ?? undefined,
    installStrategy: v.install_strategy as ImportedMcpVersion["installStrategy"],
    authType: v.auth_type as ImportedMcpVersion["authType"],
    verificationStatus: v.verification_status as ImportedMcpVersion["verificationStatus"],
    sandboxSupported: v.sandbox_supported,
    sandboxNotes: v.sandbox_notes,
    normalizedConfig: (v.normalized_config ?? {}) as Record<string, unknown>
  }));
}

export async function listMcps(): Promise<ImportedMcpDocument[]> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("imported_mcps")
    .select("*")
    .order("name");

  if (error) throw new Error(`listMcps failed: ${error.message}`);

  const mcpIds = (data as McpRow[]).map((row) => row.id);

  const { data: allVersions } = mcpIds.length > 0
    ? await db
        .from("imported_mcp_versions")
        .select("*")
        .in("mcp_id", mcpIds)
        .order("version", { ascending: false })
    : { data: [] };

  const versionsByMcp = new Map<string, ImportedMcpVersion[]>();
  for (const v of (allVersions ?? []) as McpVersionRow[]) {
    const list = versionsByMcp.get(v.mcp_id) ?? [];
    list.push(...parseVersionRows([v]));
    versionsByMcp.set(v.mcp_id, list);
  }

  return (data as McpRow[]).map((row) =>
    rowToMcpDocument(row, versionsByMcp.get(row.id))
  );
}

export async function getMcpByName(name: string): Promise<ImportedMcpDocument | null> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("imported_mcps")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  if (error) throw new Error(`getMcpByName failed: ${error.message}`);
  if (!data) return null;

  const row = data as McpRow;

  const { data: versionData } = await db
    .from("imported_mcp_versions")
    .select("*")
    .eq("mcp_id", row.id)
    .order("version", { ascending: false });

  const versionRows = (versionData ?? []) as McpVersionRow[];

  return rowToMcpDocument(row, parseVersionRows(versionRows));
}

export async function getMcpAtVersion(
  name: string,
  version: number
): Promise<ImportedMcpDocument | null> {
  const db = getServerSupabase();

  const { data: mcpData, error: lookupError } = await db
    .from("imported_mcps")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  if (lookupError) throw new Error(`getMcpAtVersion lookup failed: ${lookupError.message}`);
  if (!mcpData) return null;
  const currentRow = mcpData as McpRow;

  if (currentRow.version === version) {
    return getMcpByName(name);
  }

  const { data: versionData, error } = await db
    .from("imported_mcp_versions")
    .select("*")
    .eq("mcp_id", currentRow.id)
    .eq("version", version)
    .maybeSingle();

  if (error || !versionData) return null;

  const v = versionData as McpVersionRow;

  const versionRow: McpRow = {
    ...currentRow,
    version: v.version,
    version_label: buildVersionLabel(v.version),
    description: v.description,
    manifest_url: v.manifest_url,
    homepage_url: v.homepage_url,
    docs_url: v.docs_url,
    transport: v.transport,
    url: v.url,
    command: v.command,
    args: v.args,
    env_keys: v.env_keys,
    headers: v.headers,
    tags: v.tags,
    raw: v.raw,
    updated_at: v.created_at,
    package_name: v.package_name,
    package_registry: v.package_registry,
    install_strategy: v.install_strategy,
    auth_type: v.auth_type,
    verification_status: v.verification_status,
    sandbox_supported: v.sandbox_supported,
    sandbox_notes: v.sandbox_notes,
    normalized_config: v.normalized_config
  };

  return rowToMcpDocument(versionRow);
}

export async function upsertMcp(mcp: ImportedMcpDocument): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db
    .from("imported_mcps")
    .upsert(mcpToRow(mcp) as never, { onConflict: "id" });

  if (error) throw new Error(`upsertMcp failed: ${error.message}`);
}

export async function createMcpVersion(mcpId: string, version: ImportedMcpVersion): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("imported_mcp_versions").insert({
    mcp_id: mcpId,
    version: version.version,
    description: version.description,
    manifest_url: version.manifestUrl,
    homepage_url: version.homepageUrl ?? null,
    docs_url: version.docsUrl ?? null,
    transport: version.transport,
    url: version.url ?? null,
    command: version.command ?? null,
    args: version.args,
    env_keys: version.envKeys,
    headers: version.headers ?? null,
    tags: version.tags,
    raw: version.raw,
    package_name: version.packageName ?? null,
    package_registry: version.packageRegistry ?? null,
    install_strategy: version.installStrategy ?? "manual",
    auth_type: version.authType ?? "none",
    verification_status: version.verificationStatus ?? "unverified",
    sandbox_supported: version.sandboxSupported ?? false,
    sandbox_notes: version.sandboxNotes ?? "",
    normalized_config: version.normalizedConfig ?? {}
  } as never);

  if (error) throw new Error(`createMcpVersion failed: ${error.message}`);
}
