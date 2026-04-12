/**
 * Registry of external skill repositories that Loop imports from.
 * Each source defines a GitHub repo and how to discover skills within it.
 */

import { resolveBrandIcon } from "@/lib/brand-icons";

export interface ExternalSkillSource {
  id: string;
  name: string;
  org: string;
  repo: string;
  branch: string;
  skillsPath: string;
  /** When set, discover individual files matching these extensions instead of sub-directories. */
  fileExtensions?: string[];
  iconUrl: string;
  description: string;
  homepage: string;
  trustTier: "official" | "community";
  discoveryMode: "canonical" | "lead-list";
  searchQueries: string[];
  discoveryRationale: string;
  /** Slug in `skill_authors` table – skills from this source get linked to the verified author. */
  authorSlug?: string;
}

export const EXTERNAL_SKILL_SOURCES: ExternalSkillSource[] = [
  {
    authorSlug: "anthropic",
    branch: "main",
    description:
      "Official Claude agent skills from Anthropic – PDF generation, MCP building, frontend design, and more.",
    discoveryMode: "canonical",
    discoveryRationale:
      "Canonical upstream repo. Import bodies directly from the maintained skills directory.",
    homepage: "https://github.com/anthropics/skills",
    iconUrl: resolveBrandIcon("anthropic")!,
    id: "anthropic-skills",
    name: "Anthropic Skills",
    org: "anthropics",
    repo: "skills",
    searchQueries: ["anthropic skills github", "claude skills official"],
    skillsPath: "skills",
    trustTier: "official",
  },
  {
    authorSlug: "openai",
    branch: "main",
    description:
      "Official Codex agent skills from OpenAI – curated skills for coding, research, and development.",
    discoveryMode: "canonical",
    discoveryRationale:
      "Canonical upstream repo. Pull from the curated skills directory instead of scraping mirrors.",
    homepage: "https://github.com/openai/skills",
    iconUrl: resolveBrandIcon("openai")!,
    id: "openai-skills",
    name: "OpenAI Skills",
    org: "openai",
    repo: "skills",
    searchQueries: ["openai skills github", "codex skills official"],
    skillsPath: "skills/.curated",
    trustTier: "official",
  },
  {
    authorSlug: "awesome-agent-skills",
    branch: "main",
    description:
      "Community-curated list of agent skill repos – links parsed from the README.",
    discoveryMode: "lead-list",
    discoveryRationale:
      "Lead-generation surface only. Use it to discover candidates, then verify and transplant from canonical upstreams.",
    homepage: "https://github.com/heilcheng/awesome-agent-skills",
    iconUrl: resolveBrandIcon("github")!,
    id: "awesome-agent-skills",
    name: "Awesome Agent Skills",
    org: "heilcheng",
    repo: "awesome-agent-skills",
    searchQueries: ["awesome agent skills github", "mcp skills repos"],
    skillsPath: "__readme_links__",
    trustTier: "community",
  },
  {
    authorSlug: "cursor-directory",
    branch: "main",
    description:
      "Community-curated Cursor rules from cursor.directory – the largest public collection of .cursorrules files.",
    discoveryMode: "canonical",
    discoveryRationale:
      "Canonical upstream for the cursor.directory community collection. Import rules directly from the rules directory.",
    fileExtensions: [".ts"],
    homepage: "https://cursor.directory",
    iconUrl: resolveBrandIcon("cursor")!,
    id: "cursor-directory",
    name: "Cursor Directory",
    org: "leerob",
    repo: "directories",
    searchQueries: ["cursor.directory rules github", "cursor rules community"],
    skillsPath: "src/data/rules",
    trustTier: "community",
  },
  {
    authorSlug: "awesome-mcp-servers",
    branch: "main",
    description:
      "Community-curated list of MCP servers – the definitive awesome-list for Model Context Protocol integrations.",
    discoveryMode: "lead-list",
    discoveryRationale:
      "Lead list for MCP server discovery. Parse README links to find repos with SKILL.md or MCP definitions.",
    homepage: "https://github.com/appcypher/awesome-mcp-servers",
    iconUrl: resolveBrandIcon("mcp")!,
    id: "awesome-mcp-servers",
    name: "Awesome MCP Servers",
    org: "appcypher",
    repo: "awesome-mcp-servers",
    searchQueries: [
      "awesome mcp servers",
      "model context protocol servers list",
    ],
    skillsPath: "__readme_links__",
    trustTier: "community",
  },
];

export function getContentsUrl(source: ExternalSkillSource): string {
  const base = `https://api.github.com/repos/${source.org}/${source.repo}/contents`;
  return source.skillsPath ? `${base}/${source.skillsPath}` : base;
}

export function getRawUrl(source: ExternalSkillSource, path: string): string {
  return `https://raw.githubusercontent.com/${source.org}/${source.repo}/${source.branch}/${path}`;
}

/**
 * Match a URL to a known external skill source by GitHub org/repo.
 * Returns `undefined` when no source matches.
 */
export function findSourceForUrl(url: string): ExternalSkillSource | undefined {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname !== "github.com" && hostname !== "raw.githubusercontent.com") {
      return undefined;
    }
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length < 2) {
      return undefined;
    }
    const [org, repo] = segments;
    return EXTERNAL_SKILL_SOURCES.find(
      (s) =>
        s.org.toLowerCase() === org.toLowerCase() &&
        s.repo.toLowerCase() === repo.toLowerCase()
    );
  } catch {
    return undefined;
  }
}
