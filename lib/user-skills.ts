import { z } from "zod";

import {
  DEFAULT_PREFERRED_DAY,
  DEFAULT_PREFERRED_HOUR,
} from "@/lib/automation-constants";
import {
  createSkillVersion as dbCreateSkillVersion,
  getSkillVersions as dbGetSkillVersions,
} from "@/lib/db/skill-versions";
import {
  createSkill as dbCreateSkill,
  getSkillBySlug as dbGetSkillBySlug,
  getSkillIdBySlug,
  listSkills as dbListSkills,
  updateSkill as dbUpdateSkill,
} from "@/lib/db/skills";
import { buildVersionLabel, buildSkillVersionHref } from "@/lib/format";
import {
  createExcerpt,
  extractHeadings,
  slugify,
  stableHash,
} from "@/lib/markdown";
import { CATEGORY_REGISTRY } from "@/lib/registry";
import { formatScheduleLabel } from "@/lib/schedule";
import type {
  AgentDocs,
  AgentPrompt,
  AutomationSummary,
  CategorySlug,
  DailySignal,
  ReferenceDoc,
  SkillAutomationState,
  SkillRecord,
  SourceDefinition,
  SourceKind,
  UserSkillCadence,
  UserSkillDocument,
  UserSkillVersion,
  VersionReference,
} from "@/lib/types";

const CATEGORY_SLUGS = CATEGORY_REGISTRY.map((category) => category.slug) as [
  CategorySlug,
  ...CategorySlug[],
];

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const sourceSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["rss", "atom", "docs", "blog", "github", "watchlist"]),
  label: z.string().min(1),
  tags: z.array(z.string()),
  url: z.string().url(),
});

export const AUTOMATION_PROMPT_MAX_LENGTH = 600;

const automationSchema = z.object({
  cadence: z.enum(["daily", "weekly", "manual"]),
  enabled: z.boolean(),
  lastRunAt: z.string().datetime().optional(),
  prompt: z.string(),
  status: z.enum(["active", "paused"]),
});

export const createUserSkillInputSchema = z.object({
  agentDocs: z.record(z.string()).optional(),
  autoUpdate: z.boolean().default(true),
  automationCadence: z.enum(["daily", "weekly", "manual"]).default("daily"),
  automationPrompt: z
    .string()
    .trim()
    .max(AUTOMATION_PROMPT_MAX_LENGTH)
    .optional(),
  body: z.string().trim().min(40).max(24_000),
  category: z.enum(CATEGORY_SLUGS),
  description: z.string().trim().min(16).max(220),
  ownerName: z.string().trim().max(48).optional(),
  preferredDay: z.number().int().min(0).max(6).optional(),
  preferredHour: z.number().int().min(0).max(23).optional(),
  price: z
    .object({ amount: z.number(), currency: z.string() })
    .nullable()
    .optional(),
  sourceUrls: z.array(z.string().url()).max(8).default([]),
  tags: z.array(z.string().trim().min(1).max(32)).max(8).default([]),
  title: z.string().trim().min(3).max(80),
  visibility: z.enum(["public", "private"]).optional().default("private"),
});

export type CreateUserSkillInput = z.input<typeof createUserSkillInputSchema>;

export const updateUserSkillInputSchema = createUserSkillInputSchema.extend({
  slug: z.string().trim().min(1),
});

export type UpdateUserSkillInput = z.input<typeof updateUserSkillInputSchema>;

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function titleCaseFromHost(hostname: string): string {
  return hostname
    .replace(/^www\./, "")
    .split(".")
    .filter((part, index, parts) => index < parts.length - 1)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferSourceKind(url: string): SourceKind {
  const lower = url.toLowerCase();

  if (lower.endsWith(".atom") || lower.includes("/atom")) {
    return "atom";
  }
  if (lower.includes("github.com")) {
    return "github";
  }
  if (lower.includes("/docs") || lower.includes("developers.")) {
    return "docs";
  }
  if (lower.includes("/blog") || lower.includes("blog.")) {
    return "blog";
  }
  if (
    lower.includes("rss") ||
    lower.includes("feed") ||
    lower.endsWith(".xml")
  ) {
    return "rss";
  }

  return "watchlist";
}

export function normalizeTags(input: string[]): string[] {
  return [
    ...new Set(
      input
        .map((tag) => slugify(tag))
        .map((tag) => tag.replaceAll(/^-+|-+$/g, ""))
        .filter(Boolean)
    ),
  ].slice(0, 8);
}

export function normalizeSource(
  url: string,
  category: CategorySlug
): SourceDefinition {
  const parsed = new URL(url);
  const hostnameLabel = titleCaseFromHost(parsed.hostname) || "Watchlist";
  const pathLabel = parsed.pathname
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replace(/\.(xml|rss|atom|json)$/i, "")
    ?.replaceAll(/[-_]/g, " ");
  const suffix =
    pathLabel && pathLabel.toLowerCase() !== hostnameLabel.toLowerCase()
      ? ` ${pathLabel}`
      : "";
  const label = `${hostnameLabel}${suffix}`.trim();

  return {
    id: stableHash(`${category}:${url}`),
    kind: inferSourceKind(url),
    label,
    tags: normalizeTags([category, hostnameLabel, pathLabel ?? ""]),
    url,
  };
}

export function buildAutomationPrompt(
  input: Pick<CreateUserSkillInput, "automationPrompt">,
  slug: string
): string {
  const trimmedPrompt = input.automationPrompt?.trim();
  if (trimmedPrompt) {
    return trimmedPrompt;
  }
  return `Refresh $${slug} from the tracked sources. Capture only concrete changes, fold them into the skill, and stay terse.`;
}

function buildAgentPrompt(
  skill: UserSkillDocument | UserSkillVersion,
  slug: string
): AgentPrompt {
  return {
    defaultPrompt: skill.automation.prompt || `Use $${slug} for this task.`,
    displayName: "Loop default",
    path: `loop://skills/${slug}/prompt`,
    provider: "loop",
    shortDescription:
      "Base prompt synthesized from the submitted skill and its update rules.",
  };
}

function buildSourceReferences(sources: SourceDefinition[]): ReferenceDoc[] {
  return sources.map((source) => ({
    excerpt: source.tags.join(" · ") || source.kind,
    path: source.url,
    slug: source.id,
    title: source.label,
  }));
}

function formatCadence(cadence: UserSkillCadence): string {
  if (cadence === "daily") {
    return "Daily";
  }
  if (cadence === "weekly") {
    return "Weekly";
  }
  return "Manual";
}

function toVersionReference(version: UserSkillVersion): VersionReference {
  return {
    label: buildVersionLabel(version.version),
    updatedAt: version.updatedAt,
    version: version.version,
  };
}

function buildUserSkillVersion(
  fields: Omit<UserSkillVersion, "version" | "updatedAt">,
  version: number,
  updatedAt: string
): UserSkillVersion {
  return {
    updatedAt,
    version,
    ...fields,
  };
}

function latestUserSkillVersion(skill: UserSkillDocument): UserSkillVersion {
  return [...skill.versions].toSorted(
    (left, right) => right.version - left.version
  )[0];
}

function materializeUserSkillVersion(
  skill: UserSkillDocument,
  requestedVersion?: number
): UserSkillVersion {
  if (!requestedVersion) {
    return latestUserSkillVersion(skill);
  }
  return (
    skill.versions.find((version) => version.version === requestedVersion) ??
    latestUserSkillVersion(skill)
  );
}

function buildUserSkillBody(version: UserSkillVersion): string {
  const sections = [version.body.trim()];
  const latestUpdate = version.updates[0];

  sections.push(
    [
      "## Update engine",
      "- Mode: fetch -> analyze -> rewrite -> version",
      `- Cadence: ${formatCadence(version.automation.cadence)}`,
      `- Status: ${version.automation.status}`,
      `- Sources tracked: ${version.sources.length}`,
      latestUpdate
        ? `- Last refresh: ${latestUpdate.generatedAt}`
        : "- Last refresh: waiting for first pass",
    ].join("\n")
  );

  if (latestUpdate) {
    sections.push(
      [
        "## Latest automated refresh",
        latestUpdate.summary,
        "",
        latestUpdate.whatChanged,
        "",
        `- Body edits: ${latestUpdate.bodyChanged ? "yes" : "no"}`,
        `- Editor: ${latestUpdate.editorModel ?? "heuristic-fallback"}`,
        latestUpdate.changedSections && latestUpdate.changedSections.length > 0
          ? `- Sections changed: ${latestUpdate.changedSections.join(", ")}`
          : "- Sections changed: none recorded",
        "",
        "### Suggested moves",
        ...latestUpdate.experiments.map((experiment) => `- ${experiment}`),
      ].join("\n")
    );
  }

  if (version.sources.length > 0) {
    sections.push(
      [
        "## Tracked sources",
        ...version.sources.map(
          (source) => `- [${source.label}](${source.url}) · ${source.kind}`
        ),
      ].join("\n")
    );
  }

  if (version.updates.length > 0) {
    sections.push(
      [
        "## Recent signal log",
        ...version.updates
          .slice(0, 3)
          .map((update) => `- ${update.generatedAt}: ${update.summary}`),
      ].join("\n")
    );
  }

  return sections.filter(Boolean).join("\n\n");
}

function buildEditableTags(
  existing: string[],
  category: CategorySlug,
  nextTags: string[]
): string[] {
  const marker = existing.includes("tracked") ? "tracked" : "community";
  const filtered = nextTags.filter(
    (tag) => tag !== "tracked" && tag !== "community"
  );
  return normalizeTags([category, ...filtered, marker]);
}

export function sameSourceList(
  left: SourceDefinition[],
  right: SourceDefinition[]
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function sameAutomation(
  left: SkillAutomationState,
  right: SkillAutomationState
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function cloneVersion(version: UserSkillVersion): UserSkillVersion {
  return {
    ...version,
    automation: { ...version.automation },
    sources: version.sources.map((source) => ({
      ...source,
      tags: [...source.tags],
    })),
    tags: [...version.tags],
    updates: version.updates.map((update) => ({
      ...update,
      changedSections: update.changedSections
        ? [...update.changedSections]
        : undefined,
      experiments: [...update.experiments],
      items: update.items.map((item) => ({ ...item, tags: [...item.tags] })),
    })),
  };
}

// ---------------------------------------------------------------------------
// Public pure logic
// ---------------------------------------------------------------------------

export function isUserSkillAutomationDue(
  skill: UserSkillDocument,
  now = new Date()
): boolean {
  if (
    !skill.automation.enabled ||
    skill.automation.status !== "active" ||
    skill.sources.length === 0
  ) {
    return false;
  }

  if (skill.automation.cadence === "manual") {
    return false;
  }

  const failures = skill.automation.consecutiveFailures ?? 0;
  if (failures >= 3) {
    console.warn(
      `[automation] Skipping ${skill.slug}: ${failures} consecutive failures`
    );
    return false;
  }

  if (skill.automation.cadence === "weekly") {
    const preferredDay = skill.automation.preferredDay ?? DEFAULT_PREFERRED_DAY;
    if (now.getUTCDay() !== preferredDay) {
      return false;
    }
  }

  const lastRunAt = skill.automation.lastRunAt
    ? new Date(skill.automation.lastRunAt)
    : null;
  if (!lastRunAt || Number.isNaN(lastRunAt.valueOf())) {
    return true;
  }

  const elapsedMs = now.valueOf() - lastRunAt.valueOf();
  const thresholdMs =
    skill.automation.cadence === "daily"
      ? 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;
  return elapsedMs >= thresholdMs;
}

export function createUserSkillDocument(
  input: CreateUserSkillInput,
  now = new Date()
): UserSkillDocument {
  const parsed = createUserSkillInputSchema.parse({
    ...input,
    ownerName: input.ownerName?.trim() || undefined,
    sourceUrls: [
      ...new Set(
        (input.sourceUrls ?? []).map((url) => url.trim()).filter(Boolean)
      ),
    ],
    tags: normalizeTags(input.tags ?? []),
  });

  const slugBase = slugify(parsed.title) || `skill-${stableHash(parsed.title)}`;
  const createdAt = now.toISOString();
  const sources = parsed.sourceUrls.map((url) =>
    normalizeSource(url, parsed.category)
  );
  const automationEnabled = parsed.autoUpdate && parsed.sourceUrls.length > 0;
  const latestVersion = buildUserSkillVersion(
    {
      agentDocs: parsed.agentDocs as AgentDocs | undefined,
      automation: {
        cadence: automationEnabled ? parsed.automationCadence : "manual",
        enabled: automationEnabled,
        preferredDay: parsed.preferredDay,
        preferredHour: parsed.preferredHour ?? DEFAULT_PREFERRED_HOUR,
        prompt: buildAutomationPrompt(parsed, slugBase),
        status: automationEnabled ? "active" : "paused",
      },
      body: parsed.body,
      category: parsed.category,
      description: parsed.description,
      ownerName: parsed.ownerName,
      sources,
      tags: normalizeTags([parsed.category, ...parsed.tags, "community"]),
      title: parsed.title,
      updates: [],
      visibility: parsed.visibility ?? "private",
    },
    1,
    createdAt
  );

  return {
    agentDocs: latestVersion.agentDocs,
    automation: latestVersion.automation,
    body: latestVersion.body,
    category: latestVersion.category,
    createdAt,
    description: latestVersion.description,
    ownerName: latestVersion.ownerName,
    slug: slugBase,
    sources: latestVersion.sources,
    tags: latestVersion.tags,
    title: latestVersion.title,
    updatedAt: createdAt,
    updates: latestVersion.updates,
    version: 1,
    versions: [latestVersion],
    visibility: latestVersion.visibility,
  };
}

/**
 * Apply user-authored edits to a skill document WITHOUT incrementing the
 * version number. Returns a new object with the same version so that callers
 * (e.g. the fused save+refresh endpoint) can pass it straight to
 * `runTrackedUserSkillUpdate`, which mints the single next version.
 */
export function applyUserEditsToSkill(
  skill: UserSkillDocument,
  input: UpdateUserSkillInput
): { skill: UserSkillDocument; changed: boolean } {
  if (input.slug !== skill.slug) {
    throw new Error(
      "The requested skill slug does not match the current document."
    );
  }

  const parsed = updateUserSkillInputSchema.parse({
    ...input,
    ownerName: input.ownerName?.trim() || undefined,
    sourceUrls: [
      ...new Set(
        (input.sourceUrls ?? []).map((url) => url.trim()).filter(Boolean)
      ),
    ],
    tags: normalizeTags(input.tags ?? []),
  });

  const nextSources = parsed.sourceUrls.map((url) =>
    normalizeSource(url, parsed.category)
  );
  const automationEnabled = parsed.autoUpdate && nextSources.length > 0;
  const nextAutomation: SkillAutomationState = {
    cadence: automationEnabled ? parsed.automationCadence : "manual",
    enabled: automationEnabled,
    lastRunAt: skill.automation.lastRunAt,
    preferredDay: parsed.preferredDay ?? skill.automation.preferredDay,
    preferredHour:
      parsed.preferredHour ??
      skill.automation.preferredHour ??
      DEFAULT_PREFERRED_HOUR,
    prompt: buildAutomationPrompt(parsed, skill.slug),
    status: automationEnabled ? "active" : "paused",
  };
  const nextTags = buildEditableTags(skill.tags, parsed.category, parsed.tags);

  const priceChanged =
    JSON.stringify(skill.price ?? null) !==
    JSON.stringify(
      parsed.price && parsed.price.amount > 0 ? parsed.price : null
    );

  const changed =
    skill.title !== parsed.title ||
    skill.description !== parsed.description ||
    skill.category !== parsed.category ||
    skill.body !== parsed.body ||
    skill.ownerName !== parsed.ownerName ||
    JSON.stringify(skill.tags) !== JSON.stringify(nextTags) ||
    !sameSourceList(skill.sources, nextSources) ||
    !sameAutomation(skill.automation, nextAutomation) ||
    priceChanged;

  const skillPrice =
    parsed.price && parsed.price.amount > 0 ? parsed.price : null;

  const editedSkill: UserSkillDocument = {
    ...skill,
    agentDocs: (parsed.agentDocs as AgentDocs | undefined) ?? skill.agentDocs,
    automation: nextAutomation,
    body: parsed.body,
    category: parsed.category,
    description: parsed.description,
    ownerName: parsed.ownerName,
    price: skillPrice,
    sources: nextSources,
    tags: nextTags,
    title: parsed.title,
  };

  return { changed, skill: editedSkill };
}

export function updateUserSkillDocument(
  skill: UserSkillDocument,
  input: UpdateUserSkillInput,
  now = new Date()
): { skill: UserSkillDocument; changed: boolean } {
  const { skill: editedSkill, changed } = applyUserEditsToSkill(skill, input);

  if (!changed) {
    return { changed: false, skill };
  }

  const updatedAt = now.toISOString();
  const nextSkill = createNextUserSkillVersion(
    skill,
    {
      agentDocs: editedSkill.agentDocs,
      automation: editedSkill.automation,
      body: editedSkill.body,
      category: editedSkill.category,
      description: editedSkill.description,
      ownerName: editedSkill.ownerName,
      price: editedSkill.price,
      sources: editedSkill.sources,
      tags: editedSkill.tags,
      title: editedSkill.title,
      updates: editedSkill.updates,
      visibility: editedSkill.visibility,
    },
    updatedAt
  );

  return { changed: true, skill: nextSkill };
}

export function createNextUserSkillVersion(
  skill: UserSkillDocument,
  next: Omit<UserSkillVersion, "version" | "updatedAt">,
  updatedAt: string
): UserSkillDocument {
  const versionNumber = skill.version + 1;
  const snapshot = buildUserSkillVersion(next, versionNumber, updatedAt);

  return {
    ...skill,
    agentDocs: snapshot.agentDocs,
    automation: snapshot.automation,
    body: snapshot.body,
    category: snapshot.category,
    description: snapshot.description,
    ownerName: snapshot.ownerName,
    sources: snapshot.sources,
    tags: snapshot.tags,
    title: snapshot.title,
    updatedAt,
    updates: snapshot.updates,
    version: versionNumber,
    versions: [snapshot, ...skill.versions.map(cloneVersion)].toSorted(
      (left, right) => right.version - left.version
    ),
    visibility: snapshot.visibility,
  };
}

export function buildUserSkillAutomation(
  skill: UserSkillDocument
): AutomationSummary | null {
  if (!skill.automation.enabled) {
    return null;
  }

  const hour = skill.automation.preferredHour ?? DEFAULT_PREFERRED_HOUR;
  const day = skill.automation.preferredDay;
  return {
    cadence: skill.automation.cadence,
    cwd: [],
    id: `user:${skill.slug}`,
    matchedCategorySlugs: [skill.category],
    matchedSkillSlugs: [skill.slug],
    name: `${skill.title} refresh`,
    path: `loop://skills/${skill.slug}/automation`,
    preferredDay: day,
    preferredHour: hour,
    preferredModel: skill.automation.preferredModel,
    prompt: skill.automation.prompt,
    schedule: formatScheduleLabel(skill.automation.cadence, hour, day),
    status: skill.automation.status.toUpperCase(),
  };
}

export function buildUserSkillRecord(
  skill: UserSkillDocument,
  requestedVersion?: number
): SkillRecord {
  const version = materializeUserSkillVersion(skill, requestedVersion);
  const body = buildUserSkillBody(version);
  const category = CATEGORY_REGISTRY.find(
    (entry) => entry.slug === version.category
  );

  const latestUpdate = version.updates[0];

  return {
    accent: category?.accent ?? "signal-red",
    agentDocs: version.agentDocs,
    agents: [buildAgentPrompt(version, skill.slug)],
    automation: version.automation,
    automations: [],
    availableVersions: [...skill.versions]
      .toSorted((left, right) => right.version - left.version)
      .map(toVersionReference),
    body,
    category: version.category,
    description: latestUpdate?.summary ?? version.description,
    excerpt: createExcerpt(body),
    featured: false,
    headings: extractHeadings(body),
    href: buildSkillVersionHref(skill.slug, version.version),
    origin: "user",
    ownerName: version.ownerName,
    path: `loop://community-skills/${skill.slug}`,
    references: buildSourceReferences(version.sources),
    relativeDir: `community/${skill.slug}`,
    slug: skill.slug,
    sources: version.sources,
    tags: normalizeTags(version.tags),
    title: version.title,
    updatedAt: version.updatedAt,
    updates: version.updates,
    version: version.version,
    versionLabel: buildVersionLabel(version.version),
    visibility: version.visibility,
  };
}

export function buildSkillUpdateSignals(
  skill: UserSkillDocument
): { label: string; items: DailySignal[] }[] {
  return skill.updates.map((update) => ({
    items: update.items,
    label: update.generatedAt,
  }));
}

// ---------------------------------------------------------------------------
// DB-backed storage operations
// ---------------------------------------------------------------------------

export function skillRecordToUserDoc(record: SkillRecord): UserSkillDocument {
  const versions: UserSkillVersion[] = record.availableVersions.map((vRef) => ({
    agentDocs: record.agentDocs,
    automation: record.automation ?? {
      cadence: "manual" as UserSkillCadence,
      enabled: false,
      prompt: "",
      status: "paused" as const,
    },
    body: record.body,
    category: record.category,
    description: record.description,
    ownerName: record.ownerName,
    sources: record.sources ?? [],
    tags: record.tags,
    title: record.title,
    updatedAt: vRef.updatedAt,
    updates: record.updates ?? [],
    version: vRef.version,
    visibility: record.visibility,
  }));

  return {
    agentDocs: record.agentDocs,
    automation: record.automation ?? {
      cadence: "manual",
      enabled: false,
      prompt: "",
      status: "paused",
    },
    body: record.body,
    category: record.category,
    createdAt: record.updatedAt,
    creatorClerkUserId: record.creatorClerkUserId,
    description: record.description,
    ownerName: record.ownerName,
    slug: record.slug,
    sources: record.sources ?? [],
    tags: record.tags,
    title: record.title,
    updatedAt: record.updatedAt,
    updates: record.updates ?? [],
    version: record.version,
    versions,
    visibility: record.visibility,
  };
}

export async function listUserSkillDocuments(): Promise<UserSkillDocument[]> {
  const records = await dbListSkills({ origin: "user" });
  return records.map(skillRecordToUserDoc);
}

interface SkillCreatorIdentity {
  creatorClerkUserId?: string;
  authorId?: string;
  ownerName?: string;
}

export async function addUserSkill(
  input: CreateUserSkillInput,
  identity?: SkillCreatorIdentity
): Promise<UserSkillDocument> {
  const document = createUserSkillDocument({
    ...input,
    ownerName: identity?.ownerName ?? input.ownerName,
  });
  const existing = await dbGetSkillBySlug(document.slug);
  if (existing) {
    throw new Error("A user skill with that slug already exists.");
  }

  await dbCreateSkill({
    agentDocs: document.agentDocs,
    authorId: identity?.authorId,
    automation: document.automation,
    body: document.body,
    category: document.category,
    creatorClerkUserId: identity?.creatorClerkUserId,
    description: document.description,
    origin: "user",
    ownerName: document.ownerName,
    price: document.price ?? null,
    slug: document.slug,
    sources: document.sources,
    tags: document.tags,
    title: document.title,
    updates: document.updates,
    version: 1,
    visibility: document.visibility,
  });

  return document;
}

export async function addTrackedSkillFromRecord(
  skill: SkillRecord,
  categorySources: SourceDefinition[],
  now = new Date()
): Promise<UserSkillDocument> {
  const existing = await dbGetSkillBySlug(skill.slug);

  const sources = categorySources.map((source) =>
    normalizeSource(source.url, skill.category)
  );
  const automationEnabled = sources.length > 0;
  const automation: SkillAutomationState = {
    cadence: automationEnabled ? "daily" : "manual",
    enabled: automationEnabled,
    preferredHour: DEFAULT_PREFERRED_HOUR,
    prompt: `Refresh $${skill.slug}: search the web for recent developments, cross-reference with tracked sources, and update the skill with concrete changes. Prioritize new versions, deprecations, and revised best practices. Stay terse and operational.`,
    status: automationEnabled ? "active" : "paused",
  };

  if (existing) {
    if (existing.origin === "user" && existing.automation?.enabled) {
      return skillRecordToUserDoc(existing);
    }

    const record = await dbUpdateSkill(existing.slug, {
      automation,
      origin: "user",
      sources,
      tags: normalizeTags([skill.category, ...skill.tags, "tracked"]),
    });
    return skillRecordToUserDoc(record);
  }

  const record = await dbCreateSkill({
    agentDocs: skill.agentDocs,
    authorId: skill.authorId,
    automation,
    body: skill.body,
    category: skill.category,
    creatorClerkUserId: skill.creatorClerkUserId,
    description: skill.description,
    origin: "user",
    ownerName: skill.ownerName,
    slug: skill.slug,
    sources,
    tags: normalizeTags([skill.category, ...skill.tags, "tracked"]),
    title: skill.title,
    updates: [],
    version: 1,
    visibility: skill.visibility,
  });

  return skillRecordToUserDoc(record);
}

export async function saveUserSkillDocuments(
  skills: UserSkillDocument[]
): Promise<void> {
  await Promise.all(
    skills.map(async (skill) => {
      await dbUpdateSkill(skill.slug, {
        agentDocs: skill.agentDocs,
        automation: skill.automation,
        body: skill.body,
        category: skill.category,
        description: skill.description,
        ownerName: skill.ownerName,
        sources: skill.sources,
        tags: skill.tags,
        title: skill.title,
        updates: skill.updates,
        version: skill.version,
        visibility: skill.visibility,
      });

      const skillId = await getSkillIdBySlug(skill.slug);
      if (skillId) {
        const existingVersions = await dbGetSkillVersions(skillId);
        const existingVersionNumbers = new Set(
          existingVersions.map((v) => v.version)
        );

        const newVersions = skill.versions.filter(
          (v) => !existingVersionNumbers.has(v.version)
        );
        await Promise.all(
          newVersions.map((v) =>
            dbCreateSkillVersion({
              agentDocs: v.agentDocs,
              automation: v.automation,
              body: v.body,
              category: v.category,
              description: v.description,
              ownerName: v.ownerName,
              skillId,
              sources: v.sources,
              tags: v.tags,
              title: v.title,
              updates: v.updates,
              version: v.version,
              visibility: v.visibility,
            })
          )
        );
      }
    })
  );
}
