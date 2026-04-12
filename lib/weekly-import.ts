import matter from "gray-matter";

import { DEFAULT_PREFERRED_HOUR } from "@/lib/automation-constants";
import { githubAvatar } from "@/lib/brand-icons";
import { getSkillBySlug, createSkill } from "@/lib/db/skills";
import {
  EXTERNAL_SKILL_SOURCES,
  getContentsUrl,
  getRawUrl,
} from "@/lib/external-skill-sources";
import type { ExternalSkillSource } from "@/lib/external-skill-sources";
import { createExcerpt, slugify } from "@/lib/markdown";
import { prefetchSourceAuthorIds } from "@/lib/source-authors";
import type {
  AgentDocKey,
  AgentDocs,
  CategorySlug,
  SkillAutomationState,
  SourceDefinition,
} from "@/lib/types";
import { AGENT_DOC_FILENAMES } from "@/lib/types";
import { normalizeSource, normalizeTags } from "@/lib/user-skills";

export interface WeeklyImportResult {
  imported: ImportedSkillSummary[];
  skipped: string[];
  errors: { slug: string; error: string }[];
}

export interface ImportedSkillSummary {
  slug: string;
  title: string;
  category: CategorySlug;
  sourceId: string;
  sourceName: string;
  description: string;
}

interface GitHubItem {
  name: string;
  path: string;
  type: "file" | "dir";
}

const CATEGORY_INFERENCE: { pattern: RegExp; category: CategorySlug }[] = [
  {
    category: "frontend",
    pattern: /frontend|react|next|vue|css|tailwind|animation|three/i,
  },
  { category: "seo-geo", pattern: /seo|crawl|schema|geo|sitemap/i },
  { category: "social", pattern: /social|linkedin|twitter|post|audience/i },
  { category: "security", pattern: /security|auth|threat|abuse/i },
  { category: "ops", pattern: /linear|github|ci|workflow|automation|ops/i },
  { category: "a2a", pattern: /agent|a2a|mcp|orchestration|tool/i },
  { category: "containers", pattern: /docker|container|kubernetes|oci/i },
  {
    category: "infra",
    pattern: /infra|cloud|serverless|edge|deploy|database/i,
  },
];

function inferCategory(slug: string, content: string): CategorySlug {
  const haystack = `${slug} ${content}`.toLowerCase();
  for (const rule of CATEGORY_INFERENCE) {
    if (rule.pattern.test(haystack)) {
      return rule.category;
    }
  }
  return "frontend";
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }
    return res.text();
  } catch {
    return null;
  }
}

async function fetchAgentDocs(
  source: ExternalSkillSource,
  skillPath: string
): Promise<AgentDocs> {
  const docs: AgentDocs = {};
  const entries = Object.entries(AGENT_DOC_FILENAMES) as [
    AgentDocKey,
    string,
  ][];

  const results = await Promise.all(
    entries.map(async ([key, filename]) => {
      const url = getRawUrl(source, `${skillPath}/${filename}`);
      const content = await fetchText(url);
      return content ? { content: content.trim(), key } : null;
    })
  );

  for (const result of results) {
    if (result) {
      docs[result.key] = result.content;
    }
  }

  return docs;
}

async function discoverFromReadmeLinks(
  source: ExternalSkillSource,
  result: WeeklyImportResult,
  authorId?: string
): Promise<void> {
  const readmeUrl = getRawUrl(source, "README.md");
  const readme = await fetchText(readmeUrl);
  if (!readme) {
    result.errors.push({ error: "Could not fetch README.md", slug: source.id });
    return;
  }

  const linkPattern = /\[([^\]]+)\]\((https?:\/\/github\.com\/[^\s)]+)\)/g;
  const candidates: { label: string; url: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(readme)) !== null) {
    const url = match[2];
    if (url.includes("/tree/") || url.includes("/blob/")) {
      continue;
    }
    if (url.split("/").filter(Boolean).length < 4) {
      continue;
    }
    candidates.push({ label: match[1], url });
  }

  const CONCURRENCY = 3;
  for (let i = 0; i < candidates.length; i += CONCURRENCY) {
    await Promise.all(
      candidates.slice(i, i + CONCURRENCY).map(async (candidate) => {
        try {
          const parts = new URL(candidate.url).pathname
            .split("/")
            .filter(Boolean);
          if (parts.length < 2) {
            return;
          }
          const [org, repo] = parts;
          const slug = slugify(repo);
          if (!slug) {
            return;
          }

          const existing = await getSkillBySlug(slug);
          if (existing) {
            result.skipped.push(slug);
            return;
          }

          const skillMdUrl = `https://raw.githubusercontent.com/${org}/${repo}/main/SKILL.md`;
          const raw = await fetchText(skillMdUrl);
          if (!raw) {
            result.skipped.push(slug);
            return;
          }

          const { data, content } = matter(raw);
          const title =
            content.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
            slug
              .split("-")
              .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
              .join(" ");
          const description = String(
            data.description ?? createExcerpt(content, 160)
          );
          const category = inferCategory(slug, `${description}\n${content}`);

          await createSkill({
            authorId,
            automation: {
              cadence: "weekly",
              enabled: true,
              prompt: `Refresh ${title}: pull latest changes from the upstream source, search the web for recent developments, and update the skill with new information. Stay terse.`,
              status: "active",
            },
            body: content.trim(),
            category,
            description,
            iconUrl: githubAvatar(org),
            origin: "remote",
            ownerName: candidate.label,
            slug,
            sources: [normalizeSource(candidate.url, category)],
            tags: normalizeTags([
              category,
              source.trustTier,
              "community",
              ...((data.tags as string[]) ?? []),
            ]),
            title,
            updates: [],
            version: 1,
            visibility: "public",
          });

          result.imported.push({
            category,
            description,
            slug,
            sourceId: source.id,
            sourceName: source.name,
            title,
          });
        } catch (error) {
          result.errors.push({
            error:
              error instanceof Error
                ? error.message
                : "Readme link import failed",
            slug: candidate.url,
          });
        }
      })
    );
  }
}

async function discoverAndImportFromSource(
  source: ExternalSkillSource,
  result: WeeklyImportResult,
  authorId?: string
): Promise<void> {
  if (source.skillsPath === "__readme_links__") {
    await discoverFromReadmeLinks(source, result, authorId);
    return;
  }

  let entries: { name: string; path: string; isFile: boolean }[] = [];

  try {
    const url = getContentsUrl(source);
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!res.ok) {
      result.errors.push({
        error: `GitHub API ${res.status}`,
        slug: source.id,
      });
      return;
    }
    const items = (await res.json()) as GitHubItem[];

    if (source.fileExtensions?.length) {
      entries = items
        .filter(
          (i) =>
            i.type === "file" &&
            source.fileExtensions!.some((ext) => i.name.endsWith(ext))
        )
        .map((i) => ({
          isFile: true,
          name: i.name.replace(/\.[^.]+$/, ""),
          path: i.path,
        }));
    } else {
      entries = items
        .filter((i) => i.type === "dir" && !i.name.startsWith("."))
        .map((i) => ({ isFile: false, name: i.name, path: i.path }));
    }
  } catch (error) {
    result.errors.push({
      error: error instanceof Error ? error.message : "Discovery failed",
      slug: source.id,
    });
    return;
  }

  const importPromises = entries.map(async (entry) => {
    const slug = entry.name;

    const existing = await getSkillBySlug(slug);
    if (existing) {
      result.skipped.push(slug);
      return;
    }

    const skillMdUrl = entry.isFile
      ? getRawUrl(source, entry.path)
      : getRawUrl(source, `${entry.path}/SKILL.md`);
    const raw = await fetchText(skillMdUrl);
    if (!raw) {
      result.skipped.push(slug);
      return;
    }

    try {
      const { data, content } = matter(raw);
      const title =
        content.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
        slug
          .split("-")
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(" ");
      const description = String(
        data.description ?? createExcerpt(content, 160)
      );
      const category = inferCategory(slug, `${description}\n${content}`);

      const agentDocs = entry.isFile
        ? ({} as AgentDocs)
        : await fetchAgentDocs(source, entry.path);

      const sourceUrl = `https://github.com/${source.org}/${source.repo}/tree/${source.branch}/${entry.path}`;
      const sources: SourceDefinition[] = [
        normalizeSource(sourceUrl, category),
      ];

      const automation: SkillAutomationState = {
        cadence: "weekly",
        enabled: true,
        preferredHour: DEFAULT_PREFERRED_HOUR,
        prompt: `Refresh ${title}: pull latest changes from the upstream source, search the web for recent developments, and update the skill with new information. Stay terse.`,
        status: "active",
      };

      await createSkill({
        agentDocs: Object.keys(agentDocs).length > 0 ? agentDocs : undefined,
        authorId,
        automation,
        body: content.trim(),
        category,
        description,
        iconUrl: source.iconUrl || undefined,
        origin: "remote",
        ownerName: source.name,
        slug,
        sources,
        tags: normalizeTags([
          category,
          source.trustTier,
          source.name.toLowerCase().replaceAll(/\s+/g, "-"),
          ...((data.tags as string[]) ?? []),
        ]),
        title,
        updates: [],
        version: 1,
        visibility: "public",
      });

      result.imported.push({
        category,
        description,
        slug,
        sourceId: source.id,
        sourceName: source.name,
        title,
      });
    } catch (error) {
      result.errors.push({
        error: error instanceof Error ? error.message : "Import failed",
        slug,
      });
    }
  });

  const CONCURRENCY = 5;
  for (let i = 0; i < importPromises.length; i += CONCURRENCY) {
    await Promise.all(importPromises.slice(i, i + CONCURRENCY));
  }
}

export async function runWeeklyImport(): Promise<WeeklyImportResult> {
  const result: WeeklyImportResult = {
    errors: [],
    imported: [],
    skipped: [],
  };

  const authorIds = await prefetchSourceAuthorIds();

  for (const source of EXTERNAL_SKILL_SOURCES) {
    await discoverAndImportFromSource(source, result, authorIds.get(source.id));
  }

  return result;
}
