import {
  EXTERNAL_SKILL_SOURCES,
  getContentsUrl,
  getRawUrl,
} from "@/lib/external-skill-sources";
import type { ExternalSkillSource } from "@/lib/external-skill-sources";

interface GitHubItem {
  name: string;
  path: string;
  type: "file" | "dir";
}

interface DiscoveredSkill {
  sourceId: string;
  sourceName: string;
  slug: string;
  path: string;
  skillMdUrl: string;
}

const GITHUB_SKILL_RE =
  /\[([^\]]+)\]\((https:\/\/github\.com\/[^/]+\/[^/)]+)\)/g;

async function discoverFromReadmeLinks(
  source: ExternalSkillSource
): Promise<DiscoveredSkill[]> {
  const readmeUrl = getRawUrl(source, "README.md");
  const res = await fetch(readmeUrl, { next: { revalidate: 3600 } });
  if (!res.ok) {
    return [];
  }

  const text = await res.text();
  const seenUrls = new Set<string>();
  const slugCounts = new Map<string, number>();
  const skills: DiscoveredSkill[] = [];

  for (const match of text.matchAll(GITHUB_SKILL_RE)) {
    const rawLabel = match[1];
    const url = match[2];
    if (seenUrls.has(url)) {
      continue;
    }
    seenUrls.add(url);

    const parts = url.replace("https://github.com/", "").split("/");
    if (parts.length < 2) {
      continue;
    }

    const containsHtml = /<[^>]+>/.test(rawLabel);
    const label = containsHtml ? parts[1] : rawLabel;
    let slug =
      label
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, "-")
        .replaceAll(/(^-|-$)/g, "") || parts[1];

    const count = slugCounts.get(slug) ?? 0;
    slugCounts.set(slug, count + 1);
    if (count > 0) {
      slug = `${slug}-${parts[0]}`;
    }

    skills.push({
      path: `${parts[0]}/${parts[1]}`,
      skillMdUrl: url,
      slug,
      sourceId: source.id,
      sourceName: source.name,
    });
  }

  return skills;
}

async function discoverFromDirectory(
  source: ExternalSkillSource
): Promise<DiscoveredSkill[]> {
  const url = getContentsUrl(source);
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github.v3+json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return [];
  }

  const items = (await res.json()) as GitHubItem[];

  if (source.fileExtensions?.length) {
    const files = items.filter(
      (item) =>
        item.type === "file" &&
        source.fileExtensions!.some((ext) => item.name.endsWith(ext))
    );
    return files.map((file) => {
      const slug = file.name.replace(/\.[^.]+$/, "");
      return {
        path: file.path,
        skillMdUrl: getRawUrl(source, file.path),
        slug,
        sourceId: source.id,
        sourceName: source.name,
      };
    });
  }

  const dirs = items.filter(
    (item) => item.type === "dir" && !item.name.startsWith(".")
  );

  return dirs.map((dir) => ({
    path: dir.path,
    skillMdUrl: getRawUrl(source, `${dir.path}/SKILL.md`),
    slug: dir.name,
    sourceId: source.id,
    sourceName: source.name,
  }));
}

function discoverSkillsFromSource(
  source: ExternalSkillSource
): Promise<DiscoveredSkill[]> {
  if (source.skillsPath === "__readme_links__") {
    return discoverFromReadmeLinks(source);
  }
  return discoverFromDirectory(source);
}

export async function GET() {
  const results = await Promise.all(
    EXTERNAL_SKILL_SOURCES.map(async (source) => {
      const skills = await discoverSkillsFromSource(source);
      return {
        count: skills.length,
        skills,
        source: {
          description: source.description,
          discoveryMode: source.discoveryMode,
          discoveryRationale: source.discoveryRationale,
          homepage: source.homepage,
          iconUrl: source.iconUrl,
          id: source.id,
          name: source.name,
          org: source.org,
          repo: source.repo,
          searchQueries: source.searchQueries,
          trustTier: source.trustTier,
        },
      };
    })
  );

  return Response.json({
    ok: true,
    sources: results,
    totalSkills: results.reduce((sum, r) => sum + r.count, 0),
  });
}
