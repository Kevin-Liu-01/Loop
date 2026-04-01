import type {
  SkillResearchProfile,
  SkillUpstreamRecord,
  SourceDefinition,
} from "@/lib/types";

export function buildResearchProfile(
  skill: { title: string; sources?: SourceDefinition[] },
  upstreams: SkillUpstreamRecord[] = []
): SkillResearchProfile {
  const sources = skill.sources ?? [];
  const discoveryQueries = Array.from(
    new Set(sources.flatMap((source) => source.searchQueries ?? []))
  ).slice(0, 8);

  const officialCount = sources.filter(
    (source) => source.trust === "official" || source.trust === "standards"
  ).length;
  const discoveryCount = sources.filter(
    (source) => source.mode === "discover" || source.mode === "search"
  ).length;

  return {
    summary:
      upstreams.length > 0
        ? `${skill.title} combines ${sources.length} tracked source${sources.length !== 1 ? "s" : ""} with ${upstreams.length} trusted upstream skill pack${upstreams.length !== 1 ? "s" : ""}. It tracks canonical feeds, discovers new docs from index-like surfaces, and folds deltas into sandbox-usable guidance.`
        : sources.length > 0
          ? `${skill.title} treats its source set as a research system: canonical feeds for concrete deltas, index-like sources for discovery, and query hints for ranking.`
          : `${skill.title} is a self-contained skill with no external feeds yet. Add sources to enable automated research and updates.`,
    process: buildProcessSteps(skill.title, sources, upstreams, discoveryCount),
    discoveryQueries,
    featuredReason:
      officialCount >= 2
        ? `${skill.title} has unusually strong source quality and broad utility, so it deserves prominent placement.`
        : undefined,
  };
}

function buildProcessSteps(
  title: string,
  sources: SourceDefinition[],
  upstreams: SkillUpstreamRecord[],
  discoveryCount: number,
): SkillResearchProfile["process"] {
  const steps: SkillResearchProfile["process"] = [];

  if (sources.length > 0) {
    steps.push({
      title: "Track canonical signals",
      detail: `Monitor ${Math.max(sources.length - discoveryCount, 0)} feed-like source${sources.length - discoveryCount !== 1 ? "s" : ""} for release notes, changelog entries, and durable upstream deltas.`,
    });
  }

  if (discoveryCount > 0) {
    steps.push({
      title: "Discover net-new docs and leads",
      detail: `Scan ${discoveryCount} discovery-oriented source${discoveryCount !== 1 ? "s" : ""} such as docs indexes and sitemaps, then rank extracted links against explicit query hints instead of trusting nav order.`,
    });
  }

  steps.push({
    title: "Transplant from trusted upstreams",
    detail:
      upstreams.length > 0
        ? `Fold implementation patterns from ${upstreams.map((u) => u.title).join(", ")} so the skill inherits a real operating model instead of boilerplate prose.`
        : "Keep the skill grounded in trusted source deltas even when there is no direct upstream skill pack to transplant from.",
  });

  steps.push({
    title: "Keep the sandbox honest",
    detail:
      "Ship prompts, MCP recommendations, and automation language that can actually be executed in Loop's sandbox instead of abstract advice theater.",
  });

  return steps;
}

export function buildQualityScore(
  sources: SourceDefinition[],
  upstreams: SkillUpstreamRecord[],
  overrideScore?: number
): number {
  if (overrideScore !== undefined) return overrideScore;

  const officialSources = sources.filter(
    (s) => s.trust === "official" || s.trust === "standards"
  ).length;
  const discoverSources = sources.filter(
    (s) => s.mode === "discover" || s.mode === "search"
  ).length;

  return Math.min(
    97,
    70 +
      upstreams.length * 4 +
      officialSources * 3 +
      discoverSources * 2 +
      Math.min(sources.length, 6)
  );
}
