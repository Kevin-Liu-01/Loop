import type { ImportedMcpDocument, SkillRecord } from "@/lib/types";

/**
 * Keep the catalogue client payload focused on fields the home UI renders.
 * Detail-only markdown, historical versions, and raw manifests stay on their
 * dedicated pages instead of being serialized into every authenticated visit.
 */
export function toHomeSkillRecord(skill: SkillRecord): SkillRecord {
  return {
    ...skill,
    agentDocs: undefined,
    agents: [],
    availableVersions: [
      {
        label: skill.versionLabel,
        updatedAt: skill.updatedAt,
        version: skill.version,
      },
    ],
    body: "",
    excerpt: "",
    headings: [],
    references: [],
    researchProfile: undefined,
    updates: [],
    upstreams: [],
  };
}

export function toHomeMcpDocument(
  mcp: ImportedMcpDocument
): ImportedMcpDocument {
  return {
    ...mcp,
    args: [],
    headers: undefined,
    normalizedConfig: undefined,
    raw: "",
    versions: [],
  };
}
