import { getServerSupabase } from "@/lib/db/client";
import { buildVersionLabel } from "@/lib/format";
import type {
  AgentDocs,
  SkillAutomationState,
  SkillUpdateEntry,
  SkillVisibility,
  SourceDefinition,
  VersionReference
} from "@/lib/types";

export type CreateSkillVersionInput = {
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
};

export async function createSkillVersion(input: CreateSkillVersionInput): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("skill_versions").insert({
    skill_id: input.skillId,
    version: input.version,
    title: input.title,
    description: input.description,
    category: input.category,
    body: input.body,
    tags: input.tags ?? [],
    owner_name: input.ownerName ?? null,
    visibility: input.visibility ?? "public",
    sources: input.sources ?? [],
    automation: input.automation ?? null,
    updates: input.updates ?? [],
    agent_docs: input.agentDocs ?? {}
  });

  if (error) throw new Error(`createSkillVersion failed: ${error.message}`);
}

export async function getSkillVersions(skillId: string): Promise<VersionReference[]> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("skill_versions")
    .select("version, created_at")
    .eq("skill_id", skillId)
    .order("version", { ascending: false });

  if (error) throw new Error(`getSkillVersions failed: ${error.message}`);

  return (data ?? []).map((row: { version: number; created_at: string }) => ({
    version: row.version,
    label: buildVersionLabel(row.version),
    updatedAt: row.created_at
  }));
}
