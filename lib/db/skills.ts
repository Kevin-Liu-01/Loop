import { getServerSupabase } from "@/lib/db/client";
import { listSkillAuthorsByIds } from "@/lib/db/skill-authors";
import { buildSkillVersionHref, buildVersionLabel } from "@/lib/format";
import { createExcerpt } from "@/lib/markdown";
import type {
  AgentDocs,
  AgentPrompt,
  AutomationSummary,
  ReferenceDoc,
  SkillResearchProfile,
  SkillAutomationState,
  SkillHeading,
  SkillOrigin,
  SkillRecord,
  SkillUpdateEntry,
  SkillVisibility,
  SourceDefinition,
  VersionReference,
} from "@/lib/types";

interface SkillRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  body: string;
  accent: string;
  featured: boolean;
  visibility: string;
  origin: string;
  path: string | null;
  relative_dir: string | null;
  tags: string[];
  headings: unknown;
  owner_name: string | null;
  author_id?: string | null;
  sources: unknown;
  automation: unknown;
  updates: unknown;
  agent_docs: unknown;
  references_data: unknown;
  agents_data: unknown;
  source_url: string | null;
  canonical_url: string | null;
  sync_enabled: boolean;
  last_synced_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  price?: { amount: number; currency: string } | null;
  creator_clerk_user_id?: string | null;
  icon_url?: string | null;
  featured_rank?: number;
  quality_score?: number;
  research_profile?: unknown;
  forked_from_slug?: string | null;
}

async function attachAuthors(
  rows: SkillRow[]
): Promise<Map<string, SkillRecord["author"]>> {
  const authorIds = [
    ...new Set(
      rows
        .map((row) => row.author_id)
        .filter((value): value is string => Boolean(value))
    ),
  ];

  const authors = await listSkillAuthorsByIds(authorIds);
  return new Map(authors.map((author) => [author.id, author]));
}

export function rowToSkillRecord(
  row: SkillRow,
  availableVersions?: VersionReference[],
  author?: SkillRecord["author"]
): SkillRecord {
  const { version } = row;
  const versions = availableVersions ?? [
    { label: buildVersionLabel(version), updatedAt: row.updated_at, version },
  ];

  return {
    accent: row.accent,
    agentDocs: (row.agent_docs ?? {}) as AgentDocs,
    agents: (row.agents_data ?? []) as AgentPrompt[],
    author,
    authorId: row.author_id ?? undefined,
    automation: (row.automation ?? undefined) as
      | SkillAutomationState
      | undefined,
    automations: [],
    availableVersions: versions,
    body: row.body,
    category: row.category as SkillRecord["category"],
    creatorClerkUserId: row.creator_clerk_user_id ?? undefined,
    description: row.description,
    excerpt: createExcerpt(row.body),
    featured: row.featured,
    featuredRank: row.featured_rank ?? 0,
    forkedFromSlug: row.forked_from_slug ?? undefined,
    headings: (row.headings ?? []) as SkillHeading[],
    href: buildSkillVersionHref(row.slug, version),
    iconUrl: row.icon_url ?? undefined,
    origin: row.origin as SkillOrigin,
    ownerName: row.owner_name ?? undefined,
    path: row.path ?? "",
    price: row.price ?? null,
    qualityScore: row.quality_score ?? 0,
    references: (row.references_data ?? []) as ReferenceDoc[],
    relativeDir: row.relative_dir ?? "",
    researchProfile: row.research_profile as SkillResearchProfile | undefined,
    slug: row.slug,
    sources: (row.sources ?? []) as SourceDefinition[],
    syncEnabled: row.sync_enabled,
    tags: row.tags,
    title: row.title,
    updatedAt: row.updated_at,
    updates: (row.updates ?? []) as SkillUpdateEntry[],
    version,
    versionLabel: buildVersionLabel(version),
    visibility: row.visibility as SkillVisibility,
  };
}

export interface CreateSkillInput {
  slug: string;
  title: string;
  description: string;
  category: string;
  body: string;
  accent?: string;
  featured?: boolean;
  visibility?: SkillVisibility;
  origin: SkillOrigin;
  path?: string;
  relativeDir?: string;
  tags?: string[];
  headings?: SkillHeading[];
  ownerName?: string;
  authorId?: string;
  sources?: SourceDefinition[];
  automation?: SkillAutomationState;
  updates?: SkillUpdateEntry[];
  agentDocs?: AgentDocs;
  references?: ReferenceDoc[];
  agents?: AgentPrompt[];
  sourceUrl?: string;
  canonicalUrl?: string;
  syncEnabled?: boolean;
  version?: number;
  price?: { amount: number; currency: string } | null;
  creatorClerkUserId?: string;
  iconUrl?: string;
  featuredRank?: number;
  qualityScore?: number;
  researchProfile?: SkillResearchProfile;
  forkedFromSlug?: string;
}

function inputToRow(input: CreateSkillInput): Record<string, unknown> {
  const row: Record<string, unknown> = {
    accent: input.accent ?? "signal-red",
    agent_docs: input.agentDocs ?? {},
    agents_data: input.agents ?? [],
    author_id: input.authorId ?? null,
    automation: input.automation ?? null,
    body: input.body,
    canonical_url: input.canonicalUrl ?? null,
    category: input.category,
    description: input.description,
    featured: input.featured ?? false,
    headings: input.headings ?? [],
    origin: input.origin,
    owner_name: input.ownerName ?? null,
    path: input.path ?? null,
    references_data: input.references ?? [],
    relative_dir: input.relativeDir ?? null,
    slug: input.slug,
    source_url: input.sourceUrl ?? null,
    sources: input.sources ?? [],
    sync_enabled: input.syncEnabled ?? false,
    tags: input.tags ?? [],
    title: input.title,
    updates: input.updates ?? [],
    version: input.version ?? 1,
    visibility: input.visibility ?? "public",
  };

  if (input.price !== undefined) {
    row.price = input.price;
  }
  if (input.creatorClerkUserId !== undefined) {
    row.creator_clerk_user_id = input.creatorClerkUserId;
  }
  if (input.iconUrl !== undefined) {
    row.icon_url = input.iconUrl;
  }
  if (input.featuredRank !== undefined) {
    row.featured_rank = input.featuredRank;
  }
  if (input.qualityScore !== undefined) {
    row.quality_score = input.qualityScore;
  }
  if (input.researchProfile !== undefined) {
    row.research_profile = input.researchProfile;
  }
  if (input.forkedFromSlug !== undefined) {
    row.forked_from_slug = input.forkedFromSlug;
  }

  return row;
}

export async function listSkills(filter?: {
  origin?: SkillOrigin;
  category?: string;
  visibility?: SkillVisibility;
}): Promise<SkillRecord[]> {
  const db = getServerSupabase();
  let query = db.from("skills").select("*");

  if (filter?.origin) {
    query = query.eq("origin", filter.origin);
  }
  if (filter?.category) {
    query = query.eq("category", filter.category);
  }
  if (filter?.visibility) {
    query = query.eq("visibility", filter.visibility);
  }

  const { data, error } = await query.order("title");
  if (error) {
    throw new Error(`listSkills failed: ${error.message}`);
  }
  const rows = data as SkillRow[];
  const authors = await attachAuthors(rows);
  return rows.map((row) =>
    rowToSkillRecord(
      row,
      undefined,
      row.author_id ? authors.get(row.author_id) : undefined
    )
  );
}

export async function getSkillBySlug(
  slug: string
): Promise<SkillRecord | null> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getSkillBySlug failed: ${error.message}`);
  }
  if (!data) {
    return null;
  }

  const { data: versions } = await db
    .from("skill_versions")
    .select("version, created_at")
    .eq("skill_id", (data as SkillRow).id)
    .order("version", { ascending: false });

  const row = data as SkillRow;
  const authors = await attachAuthors([row]);
  const availableVersions: VersionReference[] = [
    {
      label: buildVersionLabel(row.version),
      updatedAt: row.updated_at,
      version: row.version,
    },
    ...(versions ?? [])
      .filter((v: { version: number }) => v.version !== row.version)
      .map((v: { version: number; created_at: string }) => ({
        label: buildVersionLabel(v.version),
        updatedAt: v.created_at,
        version: v.version,
      })),
  ].toSorted((a, b) => b.version - a.version);

  return rowToSkillRecord(
    row,
    availableVersions,
    row.author_id ? authors.get(row.author_id) : undefined
  );
}

export async function getSkillAtVersion(
  slug: string,
  version: number
): Promise<SkillRecord | null> {
  const db = getServerSupabase();

  const { data: skillData } = await db
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!skillData) {
    return null;
  }
  const currentRow = skillData as SkillRow;

  if (currentRow.version === version) {
    return getSkillBySlug(slug);
  }

  const { data: versionData, error } = await db
    .from("skill_versions")
    .select("*")
    .eq("skill_id", currentRow.id)
    .eq("version", version)
    .maybeSingle();

  if (error || !versionData) {
    return null;
  }

  const v = versionData as {
    version: number;
    title: string;
    description: string;
    category: string;
    body: string;
    tags: string[];
    owner_name: string | null;
    visibility: string;
    sources: unknown;
    automation: unknown;
    updates: unknown;
    agent_docs: unknown;
    created_at: string;
  };

  const versionRow: SkillRow = {
    ...currentRow,
    agent_docs: v.agent_docs,
    automation: v.automation,
    body: v.body,
    category: v.category,
    description: v.description,
    owner_name: v.owner_name,
    sources: v.sources,
    tags: v.tags,
    title: v.title,
    updated_at: v.created_at,
    updates: v.updates,
    version: v.version,
    visibility: v.visibility,
  };

  const [authors, { data: allVersionRows }] = await Promise.all([
    attachAuthors([currentRow]),
    db
      .from("skill_versions")
      .select("version, created_at")
      .eq("skill_id", currentRow.id)
      .order("version", { ascending: false }),
  ]);

  const availableVersions: VersionReference[] = [
    {
      label: buildVersionLabel(currentRow.version),
      updatedAt: currentRow.updated_at,
      version: currentRow.version,
    },
    ...(allVersionRows ?? [])
      .filter((r: { version: number }) => r.version !== currentRow.version)
      .map((r: { version: number; created_at: string }) => ({
        label: buildVersionLabel(r.version),
        updatedAt: r.created_at,
        version: r.version,
      })),
  ].toSorted((a, b) => b.version - a.version);

  return rowToSkillRecord(
    versionRow,
    availableVersions,
    currentRow.author_id ? authors.get(currentRow.author_id) : undefined
  );
}

export async function createSkill(
  input: CreateSkillInput
): Promise<SkillRecord> {
  const db = getServerSupabase();
  const row = inputToRow(input);

  const { data, error } = await db
    .from("skills")
    .insert(row as never)
    .select("*")
    .single();

  if (error) {
    throw new Error(`createSkill failed: ${error.message}`);
  }
  const skillRow = data as SkillRow;
  const authors = await attachAuthors([skillRow]);
  return rowToSkillRecord(
    skillRow,
    undefined,
    skillRow.author_id ? authors.get(skillRow.author_id) : undefined
  );
}

export async function updateSkill(
  slug: string,
  updates: Partial<CreateSkillInput>
): Promise<SkillRecord> {
  const db = getServerSupabase();
  const mapped: Record<string, unknown> = {};

  if (updates.origin !== undefined) {
    mapped.origin = updates.origin;
  }
  if (updates.title !== undefined) {
    mapped.title = updates.title;
  }
  if (updates.description !== undefined) {
    mapped.description = updates.description;
  }
  if (updates.category !== undefined) {
    mapped.category = updates.category;
  }
  if (updates.body !== undefined) {
    mapped.body = updates.body;
  }
  if (updates.accent !== undefined) {
    mapped.accent = updates.accent;
  }
  if (updates.featured !== undefined) {
    mapped.featured = updates.featured;
  }
  if (updates.visibility !== undefined) {
    mapped.visibility = updates.visibility;
  }
  if (updates.tags !== undefined) {
    mapped.tags = updates.tags;
  }
  if (updates.headings !== undefined) {
    mapped.headings = updates.headings;
  }
  if (updates.ownerName !== undefined) {
    mapped.owner_name = updates.ownerName;
  }
  if (updates.authorId !== undefined) {
    mapped.author_id = updates.authorId;
  }
  if (updates.sources !== undefined) {
    mapped.sources = updates.sources;
  }
  if (updates.automation !== undefined) {
    mapped.automation = updates.automation;
  }
  if (updates.updates !== undefined) {
    mapped.updates = updates.updates;
  }
  if (updates.agentDocs !== undefined) {
    mapped.agent_docs = updates.agentDocs;
  }
  if (updates.references !== undefined) {
    mapped.references_data = updates.references;
  }
  if (updates.agents !== undefined) {
    mapped.agents_data = updates.agents;
  }
  if (updates.sourceUrl !== undefined) {
    mapped.source_url = updates.sourceUrl;
  }
  if (updates.canonicalUrl !== undefined) {
    mapped.canonical_url = updates.canonicalUrl;
  }
  if (updates.syncEnabled !== undefined) {
    mapped.sync_enabled = updates.syncEnabled;
  }
  if (updates.version !== undefined) {
    mapped.version = updates.version;
  }
  if (updates.path !== undefined) {
    mapped.path = updates.path;
  }
  if (updates.relativeDir !== undefined) {
    mapped.relative_dir = updates.relativeDir;
  }
  if (updates.price !== undefined) {
    mapped.price = updates.price;
  }
  if (updates.creatorClerkUserId !== undefined) {
    mapped.creator_clerk_user_id = updates.creatorClerkUserId;
  }
  if (updates.iconUrl !== undefined) {
    mapped.icon_url = updates.iconUrl;
  }
  if (updates.featuredRank !== undefined) {
    mapped.featured_rank = updates.featuredRank;
  }
  if (updates.qualityScore !== undefined) {
    mapped.quality_score = updates.qualityScore;
  }
  if (updates.researchProfile !== undefined) {
    mapped.research_profile = updates.researchProfile;
  }
  if (updates.forkedFromSlug !== undefined) {
    mapped.forked_from_slug = updates.forkedFromSlug;
  }

  const { data, error } = await db
    .from("skills")
    .update(mapped as never)
    .eq("slug", slug)
    .select("*")
    .single();

  if (error) {
    throw new Error(`updateSkill failed: ${error.message}`);
  }
  const row = data as SkillRow;
  const authors = await attachAuthors([row]);
  return rowToSkillRecord(
    row,
    undefined,
    row.author_id ? authors.get(row.author_id) : undefined
  );
}

export async function deleteSkill(slug: string): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("skills").delete().eq("slug", slug);
  if (error) {
    throw new Error(`deleteSkill failed: ${error.message}`);
  }
}

export async function upsertSkillFromFilesystem(
  input: CreateSkillInput
): Promise<SkillRecord> {
  const db = getServerSupabase();
  const row = inputToRow(input);

  const { data, error } = await db
    .from("skills")
    .upsert(row as never, { onConflict: "slug" })
    .select("*")
    .single();

  if (error) {
    throw new Error(`upsertSkillFromFilesystem failed: ${error.message}`);
  }
  const skillRow = data as SkillRow;
  const authors = await attachAuthors([skillRow]);
  return rowToSkillRecord(
    skillRow,
    undefined,
    skillRow.author_id ? authors.get(skillRow.author_id) : undefined
  );
}

export async function getSkillIdBySlug(slug: string): Promise<string | null> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("skills")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getSkillIdBySlug failed: ${error.message}`);
  }
  return (data as { id: string } | null)?.id ?? null;
}

export async function countUserSkills(clerkUserId: string): Promise<number> {
  const db = getServerSupabase();
  const { count, error } = await db
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("creator_clerk_user_id", clerkUserId);
  if (error) {
    throw new Error(`countUserSkills failed: ${error.message}`);
  }
  return count ?? 0;
}
