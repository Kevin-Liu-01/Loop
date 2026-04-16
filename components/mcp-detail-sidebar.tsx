import { CopyButton } from "@/components/copy-button";
import {
  GlobeIcon,
  KeyIcon,
  PlayIcon,
  TerminalIcon,
} from "@/components/frontier-icons";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { Panel, PanelHead } from "@/components/ui/panel";
import { VersionTimeline } from "@/components/version-timeline";
import { buildMcpVersionHref } from "@/lib/format";
import { supportsSandboxMcp } from "@/lib/mcp-utils";
import type { ImportedMcpTransport, VersionReference } from "@/lib/types";
import {
  textEyebrow,
  textMetricText,
  textPanelTitle,
} from "@/lib/ui-typography";

interface McpDetailSidebarProps {
  mcpName: string;
  currentVersion: number;
  sandboxHref: string;
  sandboxSupported?: boolean;
  manifestUrl: string;
  docsHref?: string;
  transport: ImportedMcpTransport;
  envKeyCount: number;
  tags: string[];
  versions: VersionReference[];
  timeZone?: string;
}

export function McpDetailSidebar({
  mcpName,
  currentVersion,
  sandboxHref,
  sandboxSupported,
  manifestUrl,
  docsHref,
  transport,
  envKeyCount,
  tags,
  timeZone,
  versions,
}: McpDetailSidebarProps) {
  const isRunnable = supportsSandboxMcp({ sandboxSupported, transport });

  return (
    <aside className="grid content-start gap-4">
      <Panel compact square>
        <PanelHead>
          <h3 className={textPanelTitle}>Quick actions</h3>
        </PanelHead>

        <div className="grid gap-2">
          {isRunnable ? (
            <LinkButton href={sandboxHref} size="sm" variant="primary">
              <PlayIcon className="h-3.5 w-3.5" />
              Run in sandbox
            </LinkButton>
          ) : null}

          {docsHref && (
            <LinkButton
              href={docsHref}
              rel="noreferrer"
              size="sm"
              target="_blank"
              variant="soft"
            >
              <GlobeIcon className="h-3.5 w-3.5" />
              Open docs
            </LinkButton>
          )}

          <CopyButton
            className="w-full text-xs"
            iconSize="sm"
            label="Copy manifest URL"
            size="sm"
            value={manifestUrl}
            variant="soft"
          />
        </div>
      </Panel>

      <Panel compact square>
        <PanelHead>
          <h3 className={textPanelTitle}>Connection</h3>
        </PanelHead>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-0.5 rounded-none border border-line bg-paper-3/90 px-3 py-2 dark:bg-paper-2/40">
            <small className={textEyebrow}>transport</small>
            <div className="flex items-center gap-1.5">
              <TerminalIcon className="h-3 w-3 text-ink-faint" />
              <strong className={textMetricText}>{transport}</strong>
            </div>
          </div>
          <div className="grid gap-0.5 rounded-none border border-line bg-paper-3/90 px-3 py-2 dark:bg-paper-2/40">
            <small className={textEyebrow}>env keys</small>
            <div className="flex items-center gap-1.5">
              <KeyIcon className="h-3 w-3 text-ink-faint" />
              <strong className={textMetricText}>{envKeyCount}</strong>
            </div>
          </div>
          <div className="col-span-2 grid gap-0.5 rounded-none border border-line bg-paper-3/90 px-3 py-2 dark:bg-paper-2/40">
            <small className={textEyebrow}>status</small>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${isRunnable ? "bg-emerald-500" : "bg-ink-faint/40"}`}
              />
              <strong className={textMetricText}>
                {isRunnable ? "Executable" : "Config only"}
              </strong>
            </div>
          </div>
        </div>
      </Panel>

      <VersionTimeline
        currentVersion={currentVersion}
        hrefBuilder={buildMcpVersionHref}
        slug={mcpName}
        timeZone={timeZone}
        versions={versions}
      />

      {tags.length > 0 && (
        <Panel compact square>
          <PanelHead>
            <h3 className={textPanelTitle}>Tags</h3>
            <Badge color="neutral">{tags.length}</Badge>
          </PanelHead>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                className="rounded bg-paper-2/90 px-2 py-0.5 text-xs font-medium text-ink-soft dark:bg-paper-2/50"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </Panel>
      )}
    </aside>
  );
}
