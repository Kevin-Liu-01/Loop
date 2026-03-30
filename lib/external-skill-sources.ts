/**
 * Registry of external skill repositories that Loop imports from.
 * Each source defines a GitHub repo and how to discover skills within it.
 */

export type ExternalSkillSource = {
  id: string;
  name: string;
  org: string;
  repo: string;
  branch: string;
  skillsPath: string;
  iconUrl: string;
  description: string;
  homepage: string;
};

export const EXTERNAL_SKILL_SOURCES: ExternalSkillSource[] = [
  {
    id: "anthropic-skills",
    name: "Anthropic Skills",
    org: "anthropics",
    repo: "skills",
    branch: "main",
    skillsPath: "skills",
    iconUrl: "https://cdn.simpleicons.org/anthropic",
    description: "Official Claude agent skills from Anthropic — PDF generation, MCP building, frontend design, and more.",
    homepage: "https://github.com/anthropics/skills",
  },
  {
    id: "openai-skills",
    name: "OpenAI Skills",
    org: "openai",
    repo: "skills",
    branch: "main",
    skillsPath: "skills/.curated",
    iconUrl: "https://github.com/openai.png?size=64",
    description: "Official Codex agent skills from OpenAI — curated skills for coding, research, and development.",
    homepage: "https://github.com/openai/skills",
  },
  {
    id: "awesome-agent-skills",
    name: "Awesome Agent Skills",
    org: "heilcheng",
    repo: "awesome-agent-skills",
    branch: "main",
    skillsPath: "__readme_links__",
    iconUrl: "https://cdn.simpleicons.org/github",
    description: "Community-curated list of agent skill repos — links parsed from the README.",
    homepage: "https://github.com/heilcheng/awesome-agent-skills",
  },
];

export function getContentsUrl(source: ExternalSkillSource): string {
  const base = `https://api.github.com/repos/${source.org}/${source.repo}/contents`;
  return source.skillsPath ? `${base}/${source.skillsPath}` : base;
}

export function getRawUrl(source: ExternalSkillSource, path: string): string {
  return `https://raw.githubusercontent.com/${source.org}/${source.repo}/${source.branch}/${path}`;
}
