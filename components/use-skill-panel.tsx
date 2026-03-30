"use client";

import { CopyButton } from "@/components/copy-button";
import { CodeIcon, LinkIcon, PlayIcon, TerminalIcon } from "@/components/frontier-icons";
import { Panel } from "@/components/ui/panel";
import { LinkButton } from "@/components/ui/link-button";
import type { AgentDocs } from "@/lib/types";

type UseSkillPanelProps = {
  slug: string;
  skillHref: string;
  agentPrompt: string;
  agentDocs?: AgentDocs;
  versionLabel: string;
};

const kicker =
  "inline-block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft";
const rowClass =
  "flex items-center gap-3 rounded-xl border border-line bg-paper-3 px-3.5 py-2.5";
const rowLabel = "min-w-0 flex-1 truncate text-sm font-medium text-ink";

const PLATFORM_LABELS: Record<string, string> = {
  cursor: "Cursor",
  claude: "Claude Code",
  codex: "Codex",
  agents: "Agents",
};

function buildCurlSnippet(slug: string): string {
  return `curl -s localhost:3000/api/skills | jq '.skills[] | select(.slug=="${slug}")'`;
}

export function UseSkillPanel({
  slug,
  skillHref,
  agentPrompt,
  agentDocs,
  versionLabel,
}: UseSkillPanelProps) {
  const curlSnippet = buildCurlSnippet(slug);
  const platformKeys = agentDocs
    ? (Object.keys(agentDocs) as string[]).filter(
        (k) => agentDocs[k] && agentDocs[k]!.trim().length > 0
      )
    : [];

  return (
    <Panel compact className="grid gap-4">
      <span className={kicker}>Use this skill</span>

      <div className="grid gap-2">
        <div className={rowClass}>
          <PlayIcon className="h-4 w-4 shrink-0 text-accent" />
          <span className={rowLabel}>Run in sandbox</span>
          <LinkButton href={`/sandbox?skill=${slug}`} size="sm" variant="soft">
            Open
          </LinkButton>
        </div>

        <div className={rowClass}>
          <CodeIcon className="h-4 w-4 shrink-0 text-ink-soft" />
          <span className={rowLabel}>Agent prompt</span>
          <CopyButton
            iconOnly
            label="Copy agent prompt"
            usageEvent={{
              kind: "copy_prompt",
              label: "Copied prompt from sidebar",
              path: skillHref,
              skillSlug: slug,
            }}
            value={agentPrompt}
          />
        </div>

        <div className={rowClass}>
          <TerminalIcon className="h-4 w-4 shrink-0 text-ink-soft" />
          <span className={rowLabel}>curl</span>
          <CopyButton
            iconOnly
            label="Copy curl command"
            usageEvent={{
              kind: "copy_url",
              label: "Copied curl snippet",
              path: skillHref,
              skillSlug: slug,
            }}
            value={curlSnippet}
          />
        </div>

        <div className={rowClass}>
          <LinkIcon className="h-4 w-4 shrink-0 text-ink-soft" />
          <span className={rowLabel}>Skill link</span>
          <CopyButton
            iconOnly
            label="Copy skill link"
            usageEvent={{
              kind: "copy_url",
              label: "Copied skill link from sidebar",
              path: skillHref,
              skillSlug: slug,
            }}
            value={skillHref}
          />
        </div>
      </div>

      {platformKeys.length > 0 && (
        <div className="grid gap-2">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.08em] text-ink-faint">
            Platform configs
          </span>
          {platformKeys.map((key) => (
            <div className={rowClass} key={key}>
              <CodeIcon className="h-4 w-4 shrink-0 text-ink-soft" />
              <span className={rowLabel}>
                {PLATFORM_LABELS[key] ?? key}
              </span>
              <CopyButton
                iconOnly
                label={`Copy ${PLATFORM_LABELS[key] ?? key} config`}
                usageEvent={{
                  kind: "copy_prompt",
                  label: `Copied ${key} agent doc`,
                  path: skillHref,
                  skillSlug: slug,
                }}
                value={agentDocs![key]!}
              />
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
