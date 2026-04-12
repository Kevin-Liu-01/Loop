import { buildSourceLogoUrl } from "@/lib/source-signals";
import type {
  LoopRunRecord,
  LoopUpdateResult,
  LoopUpdateSourceLog,
  LoopUpdateTarget,
  SkillRecord,
  SourceDefinition,
} from "@/lib/types";

export function buildLoopUpdateTarget(skill: SkillRecord): LoopUpdateTarget {
  const latestUpdate = skill.updates?.[0];

  return {
    automationLabel:
      skill.origin === "user"
        ? skill.automation?.enabled
          ? `${skill.automation.cadence} ${skill.automation.status}`
          : "manual"
        : "import sync",
    category: skill.category,
    description: skill.description,
    href: skill.href,
    lastBodyChanged: latestUpdate?.bodyChanged,
    lastChangedSections: latestUpdate?.changedSections ?? [],
    lastEditorModel: latestUpdate?.editorModel,
    lastExperiments: latestUpdate?.experiments ?? [],
    lastGeneratedAt: latestUpdate?.generatedAt,
    lastSignals: latestUpdate?.items ?? [],
    lastSummary: latestUpdate?.summary,
    lastWhatChanged: latestUpdate?.whatChanged,
    origin: skill.origin === "remote" ? "remote" : "user",
    slug: skill.slug,
    sources: (skill.sources ?? []).map((source) => ({
      id: source.id,
      kind: source.kind,
      label: source.label,
      logoUrl: source.logoUrl || buildSourceLogoUrl(source.url),
      mode: source.mode,
      parser: source.parser,
      searchQueries: source.searchQueries,
      trust: source.trust,
      url: source.url,
    })),
    title: skill.title,
    updatedAt: skill.updatedAt,
    versionLabel: skill.versionLabel,
  };
}

export function buildLoopUpdateSourceLog(
  source: SourceDefinition,
  status: LoopUpdateSourceLog["status"] = "pending"
): LoopUpdateSourceLog {
  return {
    id: source.id,
    itemCount: 0,
    items: [],
    kind: source.kind,
    label: source.label,
    logoUrl: source.logoUrl || buildSourceLogoUrl(source.url),
    mode: source.mode,
    parser: source.parser,
    searchQueries: source.searchQueries,
    status,
    trust: source.trust,
    url: source.url,
  };
}

export function buildLoopRunResult(
  run?: LoopRunRecord | null
): LoopUpdateResult | null {
  if (!run?.previousVersionLabel || !run.nextVersionLabel || !run.href) {
    return null;
  }

  return {
    addedSources: run.addedSources,
    bodyChanged: run.bodyChanged,
    changed:
      run.status === "success" &&
      (run.bodyChanged === true ||
        run.previousVersionLabel !== run.nextVersionLabel ||
        run.diffLines.some((line) => line.type !== "context")),
    changedSections: run.changedSections,
    diffLines: run.diffLines,
    editorModel: run.editorModel,
    href: run.href,
    items: run.sources.flatMap((source) => source.items).slice(0, 4),
    nextVersionLabel: run.nextVersionLabel,
    origin: run.origin,
    previousVersionLabel: run.previousVersionLabel,
    reasoningSteps: run.reasoningSteps,
    searchesUsed: run.searchesUsed,
    slug: run.slug,
    summary: run.summary,
    title: run.title,
    updatedAt: run.finishedAt,
    whatChanged: run.whatChanged,
  };
}
