import { getServerSupabase } from "@/lib/db/client";
import { buildVersionLabel } from "@/lib/format";
import type { ImportedMcpDocument, ImportedMcpVersion } from "@/lib/types";

interface McpRow {
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
}

function rowToMcpDocument(
  row: McpRow,
  versions?: ImportedMcpVersion[]
): ImportedMcpDocument {
  return {
    args: row.args,
    authType: row.auth_type as ImportedMcpDocument["authType"],
    command: row.command ?? undefined,
    createdAt: row.created_at,
    description: row.description,
    docsUrl: row.docs_url ?? undefined,
    envKeys: row.env_keys,
    headers: (row.headers ?? undefined) as Record<string, string> | undefined,
    homepageUrl: row.homepage_url ?? undefined,
    iconUrl: row.icon_url ?? undefined,
    id: row.id,
    installStrategy:
      row.install_strategy as ImportedMcpDocument["installStrategy"],
    manifestUrl: row.manifest_url,
    name: row.name,
    normalizedConfig: (row.normalized_config ?? {}) as Record<string, unknown>,
    packageName: row.package_name ?? undefined,
    packageRegistry: row.package_registry ?? undefined,
    raw: row.raw,
    sandboxNotes: row.sandbox_notes,
    sandboxSupported: row.sandbox_supported,
    slug: row.slug ?? undefined,
    tags: row.tags,
    transport: row.transport as ImportedMcpDocument["transport"],
    updatedAt: row.updated_at,
    url: row.url ?? undefined,
    verificationStatus:
      row.verification_status as ImportedMcpDocument["verificationStatus"],
    version: row.version,
    versionLabel: row.version_label,
    versions: versions ?? [],
  };
}

function mcpToRow(mcp: ImportedMcpDocument): Record<string, unknown> {
  return {
    args: mcp.args,
    auth_type: mcp.authType ?? "none",
    command: mcp.command ?? null,
    description: mcp.description,
    docs_url: mcp.docsUrl ?? null,
    env_keys: mcp.envKeys,
    headers: mcp.headers ?? null,
    homepage_url: mcp.homepageUrl ?? null,
    icon_url: mcp.iconUrl ?? null,
    id: mcp.id,
    install_strategy: mcp.installStrategy ?? "manual",
    manifest_url: mcp.manifestUrl,
    name: mcp.name,
    normalized_config: mcp.normalizedConfig ?? {},
    package_name: mcp.packageName ?? null,
    package_registry: mcp.packageRegistry ?? null,
    raw: mcp.raw,
    sandbox_notes: mcp.sandboxNotes ?? "",
    sandbox_supported: mcp.sandboxSupported ?? false,
    slug: mcp.slug ?? null,
    tags: mcp.tags,
    transport: mcp.transport,
    url: mcp.url ?? null,
    verification_status: mcp.verificationStatus ?? "unverified",
    version: mcp.version,
    version_label: mcp.versionLabel,
  };
}

interface McpVersionRow {
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
}

function parseVersionRows(rows: McpVersionRow[]): ImportedMcpVersion[] {
  return rows.map((v) => ({
    args: v.args,
    authType: v.auth_type as ImportedMcpVersion["authType"],
    command: v.command ?? undefined,
    description: v.description,
    docsUrl: v.docs_url ?? undefined,
    envKeys: v.env_keys,
    headers: (v.headers ?? undefined) as Record<string, string> | undefined,
    homepageUrl: v.homepage_url ?? undefined,
    installStrategy:
      v.install_strategy as ImportedMcpVersion["installStrategy"],
    manifestUrl: v.manifest_url,
    normalizedConfig: (v.normalized_config ?? {}) as Record<string, unknown>,
    packageName: v.package_name ?? undefined,
    packageRegistry: v.package_registry ?? undefined,
    raw: v.raw,
    sandboxNotes: v.sandbox_notes,
    sandboxSupported: v.sandbox_supported,
    tags: v.tags,
    transport: v.transport as ImportedMcpVersion["transport"],
    updatedAt: v.created_at,
    url: v.url ?? undefined,
    verificationStatus:
      v.verification_status as ImportedMcpVersion["verificationStatus"],
    version: v.version,
  }));
}

export async function listMcps(): Promise<ImportedMcpDocument[]> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("imported_mcps")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(`listMcps failed: ${error.message}`);
  }

  const mcpIds = (data as McpRow[]).map((row) => row.id);

  const { data: allVersions } =
    mcpIds.length > 0
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

export async function getMcpByName(
  name: string
): Promise<ImportedMcpDocument | null> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("imported_mcps")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  if (error) {
    throw new Error(`getMcpByName failed: ${error.message}`);
  }
  if (!data) {
    return null;
  }

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

  if (lookupError) {
    throw new Error(`getMcpAtVersion lookup failed: ${lookupError.message}`);
  }
  if (!mcpData) {
    return null;
  }
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

  if (error || !versionData) {
    return null;
  }

  const v = versionData as McpVersionRow;

  const versionRow: McpRow = {
    ...currentRow,
    args: v.args,
    auth_type: v.auth_type,
    command: v.command,
    description: v.description,
    docs_url: v.docs_url,
    env_keys: v.env_keys,
    headers: v.headers,
    homepage_url: v.homepage_url,
    install_strategy: v.install_strategy,
    manifest_url: v.manifest_url,
    normalized_config: v.normalized_config,
    package_name: v.package_name,
    package_registry: v.package_registry,
    raw: v.raw,
    sandbox_notes: v.sandbox_notes,
    sandbox_supported: v.sandbox_supported,
    tags: v.tags,
    transport: v.transport,
    updated_at: v.created_at,
    url: v.url,
    verification_status: v.verification_status,
    version: v.version,
    version_label: buildVersionLabel(v.version),
  };

  return rowToMcpDocument(versionRow);
}

export async function upsertMcp(mcp: ImportedMcpDocument): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db
    .from("imported_mcps")
    .upsert(mcpToRow(mcp) as never, { onConflict: "id" });

  if (error) {
    throw new Error(`upsertMcp failed: ${error.message}`);
  }
}

export async function createMcpVersion(
  mcpId: string,
  version: ImportedMcpVersion
): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("imported_mcp_versions").insert({
    args: version.args,
    auth_type: version.authType ?? "none",
    command: version.command ?? null,
    description: version.description,
    docs_url: version.docsUrl ?? null,
    env_keys: version.envKeys,
    headers: version.headers ?? null,
    homepage_url: version.homepageUrl ?? null,
    install_strategy: version.installStrategy ?? "manual",
    manifest_url: version.manifestUrl,
    mcp_id: mcpId,
    normalized_config: version.normalizedConfig ?? {},
    package_name: version.packageName ?? null,
    package_registry: version.packageRegistry ?? null,
    raw: version.raw,
    sandbox_notes: version.sandboxNotes ?? "",
    sandbox_supported: version.sandboxSupported ?? false,
    tags: version.tags,
    transport: version.transport,
    url: version.url ?? null,
    verification_status: version.verificationStatus ?? "unverified",
    version: version.version,
  } as never);

  if (error) {
    throw new Error(`createMcpVersion failed: ${error.message}`);
  }
}
