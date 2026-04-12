import { buildMcpVersionHref } from "@/lib/format";
import type {
  LoopSnapshot,
  SearchDocument,
  SearchDocumentKind,
  SearchHit,
  SearchIndex,
} from "@/lib/types";

interface SearchIndexOptions {
  kind?: SearchDocumentKind;
  limit?: number;
}

export function buildSearchIndex(snapshot: LoopSnapshot): SearchIndex {
  const documents: SearchDocument[] = [];

  for (const skill of snapshot.skills) {
    documents.push({
      category: skill.category,
      description: skill.description,
      href: skill.href,
      id: `skill:${skill.slug}`,
      kind: "skill",
      origin: skill.origin,
      tags: skill.tags,
      title: skill.title,
      updatedAt: skill.updatedAt,
      versionLabel: skill.versionLabel,
    });
  }

  for (const cat of snapshot.categories) {
    documents.push({
      category: cat.slug,
      description: cat.description,
      href: `/categories/${cat.slug}`,
      id: `category:${cat.slug}`,
      kind: "category",
      tags: cat.keywords,
      title: cat.title,
      updatedAt: snapshot.generatedAt,
    });
  }

  for (const mcp of snapshot.mcps) {
    documents.push({
      description: mcp.description,
      href: buildMcpVersionHref(mcp.name, mcp.version),
      id: `mcp:${mcp.id}:${mcp.version}`,
      kind: "mcp",
      origin: "system",
      tags: mcp.tags,
      title: mcp.name,
      updatedAt: mcp.updatedAt,
      versionLabel: mcp.versionLabel,
    });
  }

  for (const brief of snapshot.dailyBriefs) {
    documents.push({
      category: brief.slug,
      description: brief.summary,
      href: `/categories/${brief.slug}`,
      id: `brief:${brief.slug}`,
      kind: "brief",
      tags: brief.items.flatMap((item) => item.tags),
      title: brief.title,
      updatedAt: brief.generatedAt,
    });
  }

  const tokens: Record<string, { id: string; score: number }[]> = {};

  for (const doc of documents) {
    const docTokens = tokenize(
      `${doc.title} ${doc.description} ${doc.tags.join(" ")}`
    );
    const seen = new Map<string, number>();
    for (const t of docTokens) {
      seen.set(t, (seen.get(t) ?? 0) + 1);
    }
    for (const [token, count] of seen) {
      const titleBoost = doc.title.toLowerCase().includes(token) ? 10 : 0;
      const score = count + titleBoost;
      if (!tokens[token]) {
        tokens[token] = [];
      }
      tokens[token].push({ id: doc.id, score });
    }
  }

  return {
    documents,
    generatedAt: snapshot.generatedAt,
    tokens,
    version: 1,
  };
}

export function searchIndex(
  index: SearchIndex,
  query: string,
  options: SearchIndexOptions = {}
): SearchHit[] {
  const { kind, limit = 20 } = options;

  let candidates = index.documents;
  if (kind) {
    candidates = candidates.filter((d) => d.kind === kind);
  }

  const q = query.trim().toLowerCase();
  if (!q) {
    return candidates
      .toSorted(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, limit)
      .map((doc, i) => ({ ...doc, score: limit - i }));
  }

  const queryTokens = tokenize(q);
  const scoreMap = new Map<string, number>();

  for (const token of queryTokens) {
    const entries = index.tokens[token];
    if (!entries) {
      continue;
    }
    for (const entry of entries) {
      scoreMap.set(entry.id, (scoreMap.get(entry.id) ?? 0) + entry.score);
    }
  }

  const candidateIds = new Set(candidates.map((d) => d.id));
  const docMap = new Map(index.documents.map((d) => [d.id, d]));

  return [...scoreMap.entries()]
    .filter(([id]) => candidateIds.has(id))
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, score]) => ({ ...docMap.get(id)!, score }));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}
