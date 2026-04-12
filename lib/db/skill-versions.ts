import { getServerSupabase } from "@/lib/db/client";
import { buildVersionLabel } from "@/lib/format";
import type {
  AgentDocs,
  SkillAutomationState,
  SkillUpdateEntry,
  SkillVisibility,
  SourceDefinition,
  VersionReference,
} from "@/lib/types";

export interface CreateSkillVersionInput {
  skillId: string;
  version: number;
  title: string;
  description: string;
  category: string;
  body: string;
  tags?: string[];
  ownerName?: string;
  visibility?: SkillVisibility;
  sources?: SourceDefinition[];
  automation?: SkillAutomationState;
  updates?: SkillUpdateEntry[];
  agentDocs?: AgentDocs;
}

export async function createSkillVersion(
  input: CreateSkillVersionInput
): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("skill_versions").insert({
    agent_docs: input.agentDocs ?? {},
    automation: input.automation ?? null,
    body: input.body,
    category: input.category,
    description: input.description,
    owner_name: input.ownerName ?? null,
    skill_id: input.skillId,
    sources: input.sources ?? [],
    tags: input.tags ?? [],
    title: input.title,
    updates: input.updates ?? [],
    version: input.version,
    visibility: input.visibility ?? "public",
  } as never);

  if (error) {
    throw new Error(`createSkillVersion failed: ${error.message}`);
  }
}

export async function getSkillVersions(
  skillId: string
): Promise<VersionReference[]> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("skill_versions")
    .select("version, created_at")
    .eq("skill_id", skillId)
    .order("version", { ascending: false });

  if (error) {
    throw new Error(`getSkillVersions failed: ${error.message}`);
  }

  return (data ?? []).map((row: { version: number; created_at: string }) => ({
    label: buildVersionLabel(row.version),
    updatedAt: row.created_at,
    version: row.version,
  }));
}
