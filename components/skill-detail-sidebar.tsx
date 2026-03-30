import { PulseIcon } from "@/components/frontier-icons";
import { SkillObservabilityPanel } from "@/components/observability-panels";
import { VersionTimeline } from "@/components/version-timeline";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelHead } from "@/components/ui/panel";
import { SimpleList, SimpleListBody, SimpleListIcon, SimpleListItem, SimpleListRow } from "@/components/ui/simple-list";
import { cn } from "@/lib/cn";
import { formatRelativeDate } from "@/lib/format";
import type { DiffLine, LoopRunRecord, SkillUpdateEntry, VersionReference } from "@/lib/types";
import type { SkillUsageSummary } from "@/lib/usage";

const sidebarTitle = "m-0 text-sm font-semibold tracking-tight text-ink";
const metaLabel = "text-[0.65rem] font-medium uppercase tracking-[0.08em] text-ink-soft";
const metaValue = "text-sm font-semibold tracking-[-0.03em]";

type AttachedAutomation = {
  id: string;
  name: string;
  schedule: string;
};

type SkillDetailSidebarProps = {
  slug: string;
  currentVersion: number;
  versions: VersionReference[];
  latestRun?: LoopRunRecord | null;
  latestUpdate?: SkillUpdateEntry;
  visibleChangedSections: string[];
  diffLines: DiffLine[];
  rawDiffLength: number;
  updates?: SkillUpdateEntry[];
  automations: AttachedAutomation[];
  usage: SkillUsageSummary;
};

function formatTriggerLabel(trigger: LoopRunRecord["trigger"]): string {
  switch (trigger) {
    case "manual":
      return "Manual";
    case "automation":
      return "Automation";
    case "import-sync":
      return "Import sync";
    default:
      return trigger;
  }
}

function formatDuration(startedAt: string, finishedAt: string): string {
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function SkillDetailSidebar({
  slug,
  currentVersion,
  versions,
  latestRun,
  latestUpdate,
  visibleChangedSections,
  diffLines,
  rawDiffLength,
  updates,
  automations,
  usage
}: SkillDetailSidebarProps) {
  return (
    <aside className="grid content-start gap-5">
      <VersionTimeline
        currentVersion={currentVersion}
        slug={slug}
        versions={versions}
      />

      {latestUpdate || latestRun ? (
        <Panel compact>
          <PanelHead>
            <h3 className={sidebarTitle}>Latest refresh</h3>
            {latestUpdate ? (
              <Badge>{formatRelativeDate(latestUpdate.generatedAt)}</Badge>
            ) : null}
          </PanelHead>

          {latestUpdate ? (
            <>
              <p className="m-0 text-sm text-ink-soft">{latestUpdate.summary}</p>
              {latestUpdate.whatChanged ? (
                <p className="m-0 text-sm text-ink-soft">{latestUpdate.whatChanged}</p>
              ) : null}
              {visibleChangedSections.length > 0 ? (
                <p className="m-0 text-xs text-ink-muted">
                  Sections changed: {visibleChangedSections.join(", ")}
                </p>
              ) : null}
            </>
          ) : null}

          {latestRun ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-0.5 rounded-lg border border-line bg-paper-3 px-3 py-2">
                <small className={metaLabel}>status</small>
                <strong className={cn(metaValue, latestRun.status === "error" && "text-danger")}>
                  {latestRun.status}
                </strong>
              </div>
              <div className="grid gap-0.5 rounded-lg border border-line bg-paper-3 px-3 py-2">
                <small className={metaLabel}>trigger</small>
                <strong className={metaValue}>{formatTriggerLabel(latestRun.trigger)}</strong>
              </div>
              <div className="grid gap-0.5 rounded-lg border border-line bg-paper-3 px-3 py-2">
                <small className={metaLabel}>editor</small>
                <strong className={cn(metaValue, "truncate")}>{latestRun.editorModel ?? "—"}</strong>
              </div>
              <div className="grid gap-0.5 rounded-lg border border-line bg-paper-3 px-3 py-2">
                <small className={metaLabel}>duration</small>
                <strong className={metaValue}>
                  {formatDuration(latestRun.startedAt, latestRun.finishedAt)}
                </strong>
              </div>
            </div>
          ) : null}

          {latestRun ? (
            <a className="text-xs font-medium text-accent hover:underline" href="#run-log">
              Jump to run log &darr;
            </a>
          ) : null}
        </Panel>
      ) : null}

      {diffLines.length > 0 ? (
        <Panel compact>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
              <h3 className={sidebarTitle}>Diff</h3>
              <span className="ml-auto text-xs text-ink-muted transition-transform group-open:rotate-90">▶</span>
            </summary>
            <div className="loop-diff-shell loop-diff-shell--compact mt-3">
              {diffLines.map((line, index) => (
                <div
                  className={`loop-diff-line loop-diff-line--${line.type}`}
                  key={`${line.type}-${index}`}
                >
                  <span>{line.leftNumber ?? ""}</span>
                  <span>{line.rightNumber ?? ""}</span>
                  <code>
                    {line.type === "added"
                      ? "+"
                      : line.type === "removed"
                        ? "-"
                        : " "}
                  </code>
                  <code>{line.value || " "}</code>
                </div>
              ))}
              {rawDiffLength > diffLines.length ? (
                <p className="mt-3 text-sm text-ink-soft">
                  Showing first {diffLines.length} of {rawDiffLength} lines.
                </p>
              ) : null}
            </div>
          </details>
        </Panel>
      ) : null}

      {updates && updates.length > 1 ? (
        <Panel compact>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
              <h3 className={sidebarTitle}>Update history</h3>
              <Badge>{updates.length}</Badge>
              <span className="ml-auto text-xs text-ink-muted transition-transform group-open:rotate-90">▶</span>
            </summary>
            <SimpleList tight className="mt-3">
              {updates.map((entry) => (
                <SimpleListItem key={entry.generatedAt}>
                  <SimpleListIcon>
                    <PulseIcon />
                  </SimpleListIcon>
                  <SimpleListBody>
                    <SimpleListRow>
                      <strong className="text-ink">
                        {formatRelativeDate(entry.generatedAt)}
                      </strong>
                      <span className="text-xs text-ink-soft">
                        {entry.items.length} sources
                      </span>
                    </SimpleListRow>
                    <p className="m-0 text-xs text-ink-soft">
                      {entry.summary}
                    </p>
                  </SimpleListBody>
                </SimpleListItem>
              ))}
            </SimpleList>
          </details>
        </Panel>
      ) : null}

      {automations.length > 0 ? (
        <Panel compact>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
              <h3 className={sidebarTitle}>Automations</h3>
              <Badge>{automations.length}</Badge>
              <span className="ml-auto text-xs text-ink-muted transition-transform group-open:rotate-90">▶</span>
            </summary>
            <SimpleList tight className="mt-3">
              {automations.map((auto) => (
                <SimpleListItem className="grid-cols-1" key={auto.id}>
                  <SimpleListBody>
                    <SimpleListRow>
                      <strong className="text-ink text-sm">{auto.name}</strong>
                      <span className="text-xs text-ink-soft">
                        {auto.schedule}
                      </span>
                    </SimpleListRow>
                  </SimpleListBody>
                </SimpleListItem>
              ))}
            </SimpleList>
          </details>
        </Panel>
      ) : null}

      <SkillObservabilityPanel usage={usage} />
    </aside>
  );
}
