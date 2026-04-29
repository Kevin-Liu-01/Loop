import matter from "gray-matter";
import YAML from "yaml";

import { resolveBrandIcon, githubAvatar } from "@/lib/brand-icons";
import {
  listMcps as dbListMcps,
  upsertMcp as dbUpsertMcp,
} from "@/lib/db/mcps";
import {
  createSkill as dbCreateSkill,
  getSkillBySlug as dbGetSkillBySlug,
  listSkills as dbListSkills,
  updateSkill as dbUpdateSkill,
} from "@/lib/db/skills";
import { buildVersionLabel, buildSkillVersionHref } from "@/lib/format";
import { createExcerpt, slugify, stableHash } from "@/lib/markdown";
import { CATEGORY_REGISTRY } from "@/lib/registry";
import { buildResearchProfile } from "@/lib/research-profile";
import { resolveAuthorIdForUrl } from "@/lib/source-authors";
import type {
  AgentPrompt,
  CategorySlug,
  ImportedMcpDocument,
  ImportedMcpTransport,
  ImportedMcpVersion,
  ImportedSkillDocument,
  ImportedSkillVersion,
  ReferenceDoc,
  SkillRecord,
  SourceDefinition,
  VersionReference,
} from "@/lib/types";
import { clampField, SKILL_TITLE_MAX_LENGTH } from "@/lib/user-skills";

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function normalizeTags(input: string[]): string[] {
  return [
    ...new Set(
      input
        .map((tag) => slugify(tag))
        .map((tag) => tag.replaceAll(/^-+|-+$/g, ""))
        .filter(Boolean)
    ),
  ].slice(0, 10);
}

function inferTags(opts: {
  category: string;
  sourceUrl: string;
  ownerName?: string;
  title?: string;
  frontmatterTags?: string[];
}): string[] {
  const tags: string[] = [opts.category, "imported"];

  if (opts.ownerName) {
    tags.push(opts.ownerName);
  }

  if (opts.frontmatterTags?.length) {
    tags.push(...opts.frontmatterTags);
  }

  try {
    const parsed = new URL(opts.sourceUrl);
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (
      parsed.hostname === "raw.githubusercontent.com" ||
      parsed.hostname === "github.com"
    ) {
      const [org, repo] = segments;
      if (org) {
        tags.push(org);
      }
      if (repo && repo !== org) {
        tags.push(repo);
      }
    } else {
      const hostname = parsed.hostname.replace(/^www\./, "");
      const domain = hostname.split(".").slice(0, -1).join("-");
      if (domain && domain !== "raw") {
        tags.push(domain);
      }
    }
  } catch {
    /* ignore */
  }

  if (opts.title) {
    const titleWords = opts.title
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter(
        (w) =>
          w.length > 2 &&
          !["the", "and", "for", "use", "with", "when", "skill"].includes(w)
      );
    tags.push(...titleWords.slice(0, 3));
  }

  return normalizeTags(tags);
}

function toVersionReference(version: {
  version: number;
  updatedAt: string;
}): VersionReference {
  return {
    label: buildVersionLabel(version.version),
    updatedAt: version.updatedAt,
    version: version.version,
  };
}

function decodeHtml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function stripHtml(value: string): string {
  return decodeHtml(
    value
      .replaceAll(/<script[\s\S]*?<\/script>/gi, " ")
      .replaceAll(/<style[\s\S]*?<\/style>/gi, " ")
      .replaceAll(/<\/(p|div|section|article|h1|h2|h3|li|br)>/gi, "\n")
      .replaceAll(/<[^>]+>/g, " ")
      .replaceAll(/\s+\n/g, "\n")
      .replaceAll(/\n{3,}/g, "\n\n")
      .replaceAll(/[ \t]{2,}/g, " ")
      .trim()
  );
}

function looksLikeHtml(raw: string, url: string): boolean {
  return (
    raw.includes("<html") || raw.includes("<body") || /\.html?($|\?)/i.test(url)
  );
}

function normalizeImportUrl(input: string): string {
  const url = new URL(input.trim());

  if (
    url.hostname === "github.com" &&
    url.pathname.split("/").length >= 5 &&
    url.pathname.includes("/blob/")
  ) {
    const [, owner, repo, , branch, ...rest] = url.pathname.split("/");
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${rest.join("/")}`;
  }

  return url.toString();
}

function inferCategory(
  title: string,
  content: string,
  url: string
): CategorySlug {
  const haystack = `${title}\n${content}\n${url}`.toLowerCase();
  const matchedCategory = CATEGORY_REGISTRY.find((category) =>
    category.keywords.some((keyword) => haystack.includes(keyword))
  );

  return matchedCategory?.slug ?? "frontend";
}

function inferOwnerName(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === "raw.githubusercontent.com" ||
      parsed.hostname === "github.com"
    ) {
      const org = parsed.pathname.split("/").filter(Boolean)[0];
      if (org) {
        return org;
      }
    }

    const hostname = parsed.hostname.replace(/^www\./, "");
    const root = hostname.split(".").slice(0, -1).join(" ");
    if (!root) {
      return undefined;
    }

    return root
      .split(/[-_]/g)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } catch {
    return undefined;
  }
}

function inferTitle(
  content: string,
  fallbackUrl: string,
  frontmatterName?: string
): string {
  const markdownTitle = /^#\s+(.+)$/m.exec(content)?.[1]?.trim();
  if (markdownTitle) {
    return markdownTitle;
  }

  if (frontmatterName) {
    return frontmatterName;
  }

  const htmlTitle = /<title>([^<]+)<\/title>/i.exec(content)?.[1]?.trim();
  if (htmlTitle) {
    return decodeHtml(htmlTitle);
  }

  const pathname = new URL(fallbackUrl).pathname
    .split("/")
    .filter(Boolean)
    .pop();
  return (
    pathname
      ?.replace(/\.(md|markdown|txt|html)$/i, "")
      .replaceAll(/[-_]/g, " ") || "Imported skill"
  );
}

function toMarkdownBody(
  content: string,
  title: string,
  sourceUrl: string
): string {
  if (!looksLikeHtml(content, sourceUrl)) {
    return content.trim();
  }
  const plain = stripHtml(content);
  return [`# ${title}`, "", plain].join("\n");
}

/**
 * Parse YAML frontmatter from raw markdown.
 * Returns the frontmatter data and the body content with frontmatter stripped.
 */
function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  try {
    const parsed = matter(raw);
    return {
      content: parsed.content,
      data: parsed.data as Record<string, unknown>,
    };
  } catch {
    return { content: raw, data: {} };
  }
}

export async function fetchRemoteText(
  inputUrl: string
): Promise<{ raw: string; normalizedUrl: string }> {
  const normalizedUrl = normalizeImportUrl(inputUrl);
  const response = await fetch(normalizedUrl, {
    cache: "no-store",
    headers: { "user-agent": "LoopImporter/0.1 (+https://loop.local)" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Import failed with ${response.status}.`);
  }

  return { normalizedUrl, raw: await response.text() };
}

function buildImportedSource(
  skill: ImportedSkillDocument | ImportedSkillVersion
): SourceDefinition {
  return {
    id: stableHash(skill.canonicalUrl),
    kind: "docs",
    label: "Canonical source",
    tags: normalizeTags([skill.category, "imported"]),
    url: skill.canonicalUrl,
  };
}

function buildImportedAgent(
  skill: ImportedSkillDocument | ImportedSkillVersion,
  slug: string
): AgentPrompt {
  return {
    defaultPrompt: `Use $${slug}. Prefer the imported source at ${skill.canonicalUrl}.`,
    displayName: "Imported skill prompt",
    path: `loop://imports/skills/${slug}`,
    provider: "loop-import",
    shortDescription: "Context synthesized from a remote skill import.",
  };
}

function buildImportedSkillVersion(
  fields: Omit<ImportedSkillVersion, "version" | "updatedAt">,
  version: number,
  updatedAt: string
): ImportedSkillVersion {
  return { updatedAt, version, ...fields };
}

function materializeImportedSkillVersion(
  skill: ImportedSkillDocument,
  requestedVersion?: number
): ImportedSkillVersion {
  if (!requestedVersion) {
    return [...skill.versions].toSorted(
      (left, right) => right.version - left.version
    )[0];
  }

  return (
    skill.versions.find((version) => version.version === requestedVersion) ??
    [...skill.versions].toSorted(
      (left, right) => right.version - left.version
    )[0]
  );
}

function buildImportedMcpVersion(
  fields: Omit<ImportedMcpVersion, "version" | "updatedAt">,
  version: number,
  updatedAt: string
): ImportedMcpVersion {
  return { updatedAt, version, ...fields };
}

function guessTransport(config: Record<string, unknown>): ImportedMcpTransport {
  const transport =
    typeof config.transport === "string" ? config.transport.toLowerCase() : "";
  const endpoint =
    typeof config.url === "string" ? config.url.toLowerCase() : "";

  if (transport === "stdio") {
    return "stdio";
  }
  if (transport === "sse" || endpoint.includes("/sse")) {
    return "sse";
  }
  if (
    transport === "http" ||
    endpoint.startsWith("http://") ||
    endpoint.startsWith("https://")
  ) {
    return "http";
  }
  if (
    transport === "ws" ||
    endpoint.startsWith("ws://") ||
    endpoint.startsWith("wss://")
  ) {
    return "ws";
  }
  if (config.command) {
    return "stdio";
  }

  return "unknown";
}

function normalizeMcpRecord(
  name: string,
  config: Record<string, unknown>,
  manifestUrl: string,
  raw: string,
  now: string
): ImportedMcpDocument {
  const transport = guessTransport(config);
  const description =
    typeof config.description === "string"
      ? config.description
      : typeof config.summary === "string"
        ? config.summary
        : `Imported MCP server definition for ${name}.`;

  const command =
    typeof config.command === "string"
      ? config.command
      : Array.isArray(config.command)
        ? String(config.command[0] ?? "")
        : undefined;

  const args = Array.isArray(config.args)
    ? config.args.map((value) => String(value))
    : Array.isArray(config.command)
      ? config.command.slice(1).map(String)
      : [];
  const env =
    config.env && typeof config.env === "object" && !Array.isArray(config.env)
      ? Object.keys(config.env as Record<string, unknown>)
      : [];

  const version = buildImportedMcpVersion(
    {
      args,
      command,
      description,
      envKeys: env,
      headers:
        config.headers &&
        typeof config.headers === "object" &&
        !Array.isArray(config.headers)
          ? Object.fromEntries(
              Object.entries(config.headers as Record<string, unknown>).map(
                ([key, value]) => [key, String(value)]
              )
            )
          : undefined,
      homepageUrl:
        typeof config.homepage === "string"
          ? config.homepage
          : typeof config.url === "string"
            ? config.url
            : undefined,
      manifestUrl,
      raw,
      tags: normalizeTags([name, transport, new URL(manifestUrl).hostname]),
      transport,
      url: typeof config.url === "string" ? config.url : undefined,
    },
    1,
    now
  );

  return {
    args: version.args,
    command: version.command,
    createdAt: now,
    description: version.description,
    envKeys: version.envKeys,
    headers: version.headers,
    homepageUrl: version.homepageUrl,
    id: stableHash(`${manifestUrl}:${name}`),
    manifestUrl: version.manifestUrl,
    name,
    raw: version.raw,
    tags: version.tags,
    transport: version.transport,
    updatedAt: now,
    url: version.url,
    version: 1,
    versionLabel: buildVersionLabel(1),
    versions: [version],
  };
}

function extractManifestCandidate(raw: string): string {
  const fencedBlocks = [
    ...raw.matchAll(/```(?:json|yaml|yml)?\n([\s\S]*?)```/g),
  ].map((match) => match[1]);
  return fencedBlocks[0] ?? raw;
}

function parseManifestObject(raw: string): unknown {
  const candidate = extractManifestCandidate(raw);
  try {
    return JSON.parse(candidate);
  } catch {
    try {
      return YAML.parse(candidate);
    } catch {
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Public pure builders
// ---------------------------------------------------------------------------

export function extractMcpDocuments(
  raw: string,
  manifestUrl: string
): ImportedMcpDocument[] {
  const now = new Date().toISOString();
  const parsed = parseManifestObject(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("No MCP manifest shape was found at that URL.");
  }

  const object = parsed as Record<string, unknown>;
  const recordEntries: [string, Record<string, unknown>][] =
    object.mcpServers &&
    typeof object.mcpServers === "object" &&
    !Array.isArray(object.mcpServers)
      ? Object.entries(object.mcpServers as Record<string, unknown>).filter(
          (entry): entry is [string, Record<string, unknown>] =>
            Boolean(entry[1]) &&
            typeof entry[1] === "object" &&
            !Array.isArray(entry[1])
        )
      : Array.isArray(object.servers)
        ? (object.servers as Record<string, unknown>[]).map((server, index) => [
            typeof server.name === "string"
              ? server.name
              : `server-${index + 1}`,
            server,
          ])
        : typeof object.name === "string"
          ? [[object.name, object]]
          : [];

  const mcps = recordEntries.map(([name, config]) =>
    normalizeMcpRecord(name, config, manifestUrl, raw, now)
  );
  if (mcps.length === 0) {
    throw new Error(
      "The fetched file did not contain an MCP server definition."
    );
  }

  return mcps;
}

export function buildImportedSkillDraft(
  raw: string,
  sourceUrl: string,
  now = new Date()
): ImportedSkillDocument {
  const { data, content } = parseFrontmatter(raw);
  const fmName =
    typeof data.name === "string"
      ? data.name
          .split("-")
          .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(" ")
      : undefined;
  const fmDescription =
    typeof data.description === "string" ? data.description : undefined;

  const title = clampField(
    inferTitle(content, sourceUrl, fmName),
    SKILL_TITLE_MAX_LENGTH
  );
  const body = toMarkdownBody(content, title, sourceUrl);
  const description = fmDescription || createExcerpt(body);
  const category = inferCategory(title, body, sourceUrl);
  const createdAt = now.toISOString();
  const slugBase = slugify(title) || `imported-skill-${stableHash(sourceUrl)}`;

  const version = buildImportedSkillVersion(
    {
      body,
      canonicalUrl: sourceUrl,
      category,
      description,
      lastSyncedAt: createdAt,
      ownerName: inferOwnerName(sourceUrl),
      sourceUrl,
      syncEnabled: true,
      tags: inferTags({
        category,
        frontmatterTags: Array.isArray(data.tags)
          ? data.tags.map(String)
          : undefined,
        ownerName: inferOwnerName(sourceUrl),
        sourceUrl,
        title,
      }),
      title,
      visibility: "public",
    },
    1,
    createdAt
  );

  return {
    body: version.body,
    canonicalUrl: version.canonicalUrl,
    category: version.category,
    createdAt,
    description: version.description,
    lastSyncedAt: version.lastSyncedAt,
    ownerName: version.ownerName,
    slug: `${slugBase}-${stableHash(sourceUrl).slice(0, 6)}`,
    sourceUrl: version.sourceUrl,
    syncEnabled: version.syncEnabled,
    tags: version.tags,
    title: version.title,
    updatedAt: createdAt,
    version: 1,
    versions: [version],
    visibility: version.visibility,
  };
}

export function buildImportedSkillRecord(
  skill: ImportedSkillDocument,
  requestedVersion?: number
): SkillRecord {
  const version = materializeImportedSkillVersion(skill, requestedVersion);
  const source = buildImportedSource(version);
  const category = CATEGORY_REGISTRY.find(
    (entry) => entry.slug === version.category
  );
  const body = [
    version.body.trim(),
    "",
    "## Import metadata",
    `- Source: [${version.canonicalUrl}](${version.canonicalUrl})`,
    `- Sync: ${version.syncEnabled ? "enabled" : "manual"}`,
    `- Last sync: ${version.lastSyncedAt ?? "not yet"}`,
  ].join("\n");

  const references: ReferenceDoc[] = [
    {
      excerpt: version.description,
      path: source.url,
      slug: source.id,
      title: "Canonical source",
    },
  ];

  return {
    accent: category?.accent ?? "signal-red",
    agents: [buildImportedAgent(version, skill.slug)],
    authorId: skill.authorId,
    automations: [],
    availableVersions: [...skill.versions]
      .toSorted((left, right) => right.version - left.version)
      .map(toVersionReference),
    body,
    category: version.category,
    description: version.description,
    excerpt: createExcerpt(body),
    featured: false,
    headings: [],
    href: buildSkillVersionHref(skill.slug, version.version),
    origin: "remote",
    ownerName: version.ownerName,
    path: version.canonicalUrl,
    references,
    relativeDir: `imports/${skill.slug}`,
    slug: skill.slug,
    sources: [source],
    tags: normalizeTags(version.tags),
    title: version.title,
    updatedAt: version.updatedAt,
    version: version.version,
    versionLabel: buildVersionLabel(version.version),
    visibility: version.visibility,
  };
}

export function createNextImportedSkillVersion(
  skill: ImportedSkillDocument,
  next: Omit<ImportedSkillVersion, "version" | "updatedAt">,
  updatedAt: string
): ImportedSkillDocument {
  const versionNumber = skill.version + 1;
  const snapshot = buildImportedSkillVersion(next, versionNumber, updatedAt);

  return {
    ...skill,
    body: snapshot.body,
    canonicalUrl: snapshot.canonicalUrl,
    category: snapshot.category,
    description: snapshot.description,
    lastSyncedAt: snapshot.lastSyncedAt,
    ownerName: snapshot.ownerName,
    sourceUrl: snapshot.sourceUrl,
    syncEnabled: snapshot.syncEnabled,
    tags: snapshot.tags,
    title: snapshot.title,
    updatedAt,
    version: versionNumber,
    versions: [snapshot, ...skill.versions].toSorted(
      (left, right) => right.version - left.version
    ),
    visibility: snapshot.visibility,
  };
}

export function createNextImportedMcpVersion(
  mcp: ImportedMcpDocument,
  next: Omit<ImportedMcpVersion, "version" | "updatedAt">,
  updatedAt: string
): ImportedMcpDocument {
  const versionNumber = mcp.version + 1;
  const snapshot = buildImportedMcpVersion(next, versionNumber, updatedAt);

  return {
    ...mcp,
    args: snapshot.args,
    command: snapshot.command,
    description: snapshot.description,
    envKeys: snapshot.envKeys,
    headers: snapshot.headers,
    homepageUrl: snapshot.homepageUrl,
    manifestUrl: snapshot.manifestUrl,
    raw: snapshot.raw,
    tags: snapshot.tags,
    transport: snapshot.transport,
    updatedAt,
    url: snapshot.url,
    version: versionNumber,
    versionLabel: buildVersionLabel(versionNumber),
    versions: [snapshot, ...mcp.versions].toSorted(
      (left, right) => right.version - left.version
    ),
  };
}

export function getImportedMcpVersion(
  mcp: ImportedMcpDocument,
  requestedVersion?: number
): ImportedMcpVersion {
  if (!requestedVersion) {
    return [...mcp.versions].toSorted(
      (left, right) => right.version - left.version
    )[0];
  }

  return (
    mcp.versions.find((version) => version.version === requestedVersion) ??
    [...mcp.versions].toSorted((left, right) => right.version - left.version)[0]
  );
}

export async function syncImportedSkill(
  skill: ImportedSkillDocument
): Promise<ImportedSkillDocument> {
  const { raw, normalizedUrl } = await fetchRemoteText(skill.canonicalUrl);
  const refreshed = buildImportedSkillDraft(raw, normalizedUrl, new Date());
  const latest = materializeImportedSkillVersion(skill);

  const changed =
    latest.title !== refreshed.title ||
    latest.description !== refreshed.description ||
    latest.category !== refreshed.category ||
    latest.body !== refreshed.body ||
    latest.canonicalUrl !== refreshed.canonicalUrl ||
    latest.ownerName !== refreshed.ownerName ||
    JSON.stringify(latest.tags) !== JSON.stringify(refreshed.tags);

  if (!changed) {
    return {
      ...skill,
      lastSyncedAt: refreshed.lastSyncedAt,
      updatedAt: skill.updatedAt,
    };
  }

  return createNextImportedSkillVersion(
    skill,
    {
      body: refreshed.body,
      canonicalUrl: refreshed.canonicalUrl,
      category: refreshed.category,
      description: refreshed.description,
      lastSyncedAt: refreshed.lastSyncedAt,
      ownerName: refreshed.ownerName,
      sourceUrl: refreshed.sourceUrl,
      syncEnabled: refreshed.syncEnabled,
      tags: refreshed.tags,
      title: refreshed.title,
      visibility: refreshed.visibility,
    },
    refreshed.updatedAt
  );
}

// ---------------------------------------------------------------------------
// DB-backed storage operations
// ---------------------------------------------------------------------------

function skillRecordToImportedDoc(record: SkillRecord): ImportedSkillDocument {
  const syncEnabled = record.syncEnabled ?? true;

  const versions: ImportedSkillVersion[] = record.availableVersions.map(
    (vRef) => ({
      authorId: record.authorId,
      body: record.body,
      canonicalUrl: record.path,
      category: record.category,
      description: record.description,
      lastSyncedAt: vRef.updatedAt,
      ownerName: record.ownerName,
      sourceUrl: record.path,
      syncEnabled,
      tags: record.tags,
      title: record.title,
      updatedAt: vRef.updatedAt,
      version: vRef.version,
      visibility: record.visibility,
    })
  );

  return {
    authorId: record.authorId,
    body: record.body,
    canonicalUrl: record.path,
    category: record.category,
    createdAt: record.updatedAt,
    description: record.description,
    lastSyncedAt: record.updatedAt,
    ownerName: record.ownerName,
    slug: record.slug,
    sourceUrl: record.path,
    syncEnabled,
    tags: record.tags,
    title: record.title,
    updatedAt: record.updatedAt,
    version: record.version,
    versions,
    visibility: record.visibility,
  };
}

export async function listImportedSkills(): Promise<ImportedSkillDocument[]> {
  const records = await dbListSkills({ origin: "remote" });
  return records.map(skillRecordToImportedDoc);
}

export async function listImportedMcps(): Promise<ImportedMcpDocument[]> {
  return dbListMcps();
}

export async function saveImportedSkills(
  skills: ImportedSkillDocument[]
): Promise<void> {
  await Promise.all(
    skills.map(async (skill) => {
      await dbUpdateSkill(skill.slug, {
        authorId: skill.authorId,
        body: skill.body,
        canonicalUrl: skill.canonicalUrl,
        category: skill.category,
        description: skill.description,
        ownerName: skill.ownerName,
        sourceUrl: skill.sourceUrl,
        syncEnabled: skill.syncEnabled,
        tags: skill.tags,
        title: skill.title,
        version: skill.version,
        visibility: skill.visibility,
      }).catch(() =>
        dbCreateSkill({
          authorId: skill.authorId,
          body: skill.body,
          canonicalUrl: skill.canonicalUrl,
          category: skill.category,
          description: skill.description,
          origin: "remote",
          ownerName: skill.ownerName,
          slug: skill.slug,
          sourceUrl: skill.sourceUrl,
          syncEnabled: skill.syncEnabled,
          tags: skill.tags,
          title: skill.title,
          version: skill.version,
          visibility: skill.visibility,
        })
      );
    })
  );
}

async function fetchSiblingAgentDocs(
  sourceUrl: string
): Promise<Record<string, string>> {
  const isGitHubRaw = sourceUrl.includes("raw.githubusercontent.com");
  if (!isGitHubRaw) {
    return {};
  }

  const dirUrl = sourceUrl.replace(/\/[^/]+$/, "");
  const SIBLING_FILENAMES: Record<string, string> = {
    "AGENTS.md": "agents",
    "claude.md": "claude",
    "codex.md": "codex",
    "cursor.md": "cursor",
  };

  const docs: Record<string, string> = {};
  const fetches = Object.entries(SIBLING_FILENAMES).map(
    async ([filename, key]) => {
      try {
        const res = await fetch(`${dirUrl}/${filename}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) {
          return;
        }
        const text = await res.text();
        if (text.trim()) {
          docs[key] = text.trim();
        }
      } catch {
        // silently skip
      }
    }
  );

  await Promise.all(fetches);
  return docs;
}

function inferIconUrlFromSource(sourceUrl: string): string | undefined {
  const lower = sourceUrl.toLowerCase();

  const knownBrands: [string, string][] = [
    ["anthropic", "anthropic"],
    ["openai", "openai"],
    ["vercel", "vercel"],
    ["supabase", "supabase"],
  ];
  for (const [pattern, brandKey] of knownBrands) {
    if (lower.includes(pattern)) {
      return resolveBrandIcon(brandKey);
    }
  }

  try {
    const { hostname } = new URL(sourceUrl);
    if (hostname === "github.com" || hostname === "raw.githubusercontent.com") {
      const parts = sourceUrl.split("/");
      const org = parts[3];
      if (org) {
        return githubAvatar(org);
      }
    }
  } catch {
    // ignore
  }

  return undefined;
}

export interface ImportSourceMeta {
  sourceName?: string;
  sourceIconUrl?: string;
  /** Pre-resolved verified author ID – skips URL-based author lookup when set. */
  authorId?: string;
}

export async function importRemoteSkill(
  inputUrl: string,
  sourceMeta?: ImportSourceMeta
): Promise<ImportedSkillDocument> {
  const { raw, normalizedUrl } = await fetchRemoteText(inputUrl);
  const draft = buildImportedSkillDraft(raw, normalizedUrl);

  const [agentDocs, inferredIcon, resolvedAuthorId] = await Promise.all([
    fetchSiblingAgentDocs(normalizedUrl),
    Promise.resolve(inferIconUrlFromSource(normalizedUrl)),
    sourceMeta?.authorId
      ? Promise.resolve(sourceMeta.authorId)
      : resolveAuthorIdForUrl(inputUrl),
  ]);

  const ownerName = sourceMeta?.sourceName || draft.ownerName;
  const iconUrl = sourceMeta?.sourceIconUrl || inferredIcon;
  const authorId = resolvedAuthorId || undefined;

  const hasAgentDocs = Object.keys(agentDocs).length > 0;
  const canonicalSource = buildImportedSource({
    ...draft.versions[0],
    canonicalUrl: draft.canonicalUrl,
  });
  const sources = [canonicalSource];
  const researchProfile = buildResearchProfile({ sources, title: draft.title });

  await dbCreateSkill({
    agentDocs: hasAgentDocs ? agentDocs : undefined,
    authorId,
    body: draft.body,
    canonicalUrl: draft.canonicalUrl,
    category: draft.category,
    description: draft.description,
    iconUrl,
    origin: "remote",
    ownerName,
    researchProfile,
    slug: draft.slug,
    sourceUrl: draft.sourceUrl,
    sources,
    syncEnabled: draft.syncEnabled,
    tags: draft.tags,
    title: draft.title,
    version: 1,
    visibility: draft.visibility,
  }).catch(async () => {
    await dbUpdateSkill(draft.slug, {
      agentDocs: hasAgentDocs ? agentDocs : undefined,
      authorId,
      body: draft.body,
      canonicalUrl: draft.canonicalUrl,
      category: draft.category,
      description: draft.description,
      iconUrl,
      ownerName,
      researchProfile,
      sourceUrl: draft.sourceUrl,
      sources,
      syncEnabled: draft.syncEnabled,
      tags: draft.tags,
      title: draft.title,
    });
  });

  return { ...draft, authorId, ownerName };
}

export async function importRemoteMcps(
  inputUrl: string
): Promise<ImportedMcpDocument[]> {
  const { raw, normalizedUrl } = await fetchRemoteText(inputUrl);
  const documents = extractMcpDocuments(raw, normalizedUrl);
  const existingMcps = await dbListMcps();

  const mergedDocuments = documents.map((incoming) => {
    const existing = existingMcps.find(
      (entry) =>
        entry.id === incoming.id ||
        (entry.manifestUrl === incoming.manifestUrl &&
          entry.name === incoming.name)
    );

    if (!existing) {
      return incoming;
    }

    const latest = getImportedMcpVersion(existing);
    const changed =
      latest.description !== incoming.description ||
      latest.manifestUrl !== incoming.manifestUrl ||
      latest.homepageUrl !== incoming.homepageUrl ||
      latest.transport !== incoming.transport ||
      latest.url !== incoming.url ||
      latest.command !== incoming.command ||
      JSON.stringify(latest.args) !== JSON.stringify(incoming.args) ||
      JSON.stringify(latest.envKeys) !== JSON.stringify(incoming.envKeys) ||
      JSON.stringify(latest.headers ?? {}) !==
        JSON.stringify(incoming.headers ?? {}) ||
      JSON.stringify(latest.tags) !== JSON.stringify(incoming.tags) ||
      latest.raw !== incoming.raw;

    if (!changed) {
      return existing;
    }

    return createNextImportedMcpVersion(
      existing,
      {
        args: incoming.args,
        command: incoming.command,
        description: incoming.description,
        envKeys: incoming.envKeys,
        headers: incoming.headers,
        homepageUrl: incoming.homepageUrl,
        manifestUrl: incoming.manifestUrl,
        raw: incoming.raw,
        tags: incoming.tags,
        transport: incoming.transport,
        url: incoming.url,
      },
      incoming.updatedAt
    );
  });

  await Promise.all(mergedDocuments.map(dbUpsertMcp));
  return mergedDocuments;
}
