"use client";

import Link from "next/link";

import { CopyButton } from "@/components/copy-button";
import { ArrowRightIcon, CodeIcon, LinkIcon, PlayIcon, TerminalIcon } from "@/components/frontier-icons";
import { buttonBase, buttonSizes, buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/shadcn/tooltip";
import { cn } from "@/lib/cn";
import type { AgentDocs } from "@/lib/types";

type UseSkillPanelProps = {
  slug: string;
  skillHref: string;
  agentPrompt: string;
  agentDocs?: AgentDocs;
};

const sectionLabel =
  "text-[0.65rem] font-medium uppercase tracking-[0.08em] text-ink-soft";

const rowIcon = "h-4 w-4 shrink-0 text-ink-soft";

const rowClass =
  "flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-paper-3/80";

function ActionGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-none border border-line bg-paper-3/50 dark:bg-paper-2/40">
      <div className="divide-y divide-line">{children}</div>
    </div>
  );
}

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
}: UseSkillPanelProps) {
  const curlSnippet = buildCurlSnippet(slug);
  const platformKeys = agentDocs
    ? (Object.keys(agentDocs) as string[]).filter(
        (k) => agentDocs[k] && agentDocs[k]!.trim().length > 0
      )
    : [];

  return (
    <Panel compact square className="grid gap-3">
      <span className={sectionLabel}>Use this skill</span>

      <ActionGroup>
        <div className={rowClass}>
          <PlayIcon className={rowIcon} />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
            Run in sandbox
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                aria-label="Open sandbox"
                className={cn(
                  buttonBase,
                  buttonVariants.soft,
                  buttonSizes["icon-sm"],
                  "shrink-0"
                )}
                href={`/sandbox?skill=${slug}`}
              >
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Open sandbox</TooltipContent>
          </Tooltip>
        </div>

        <div className={rowClass}>
          <CodeIcon className={rowIcon} />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
            Agent prompt
          </span>
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
          <TerminalIcon className={rowIcon} />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">curl</span>
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
          <LinkIcon className={rowIcon} />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
            Skill link
          </span>
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
      </ActionGroup>

      {platformKeys.length > 0 ? (
        <div className="grid gap-2 pt-1">
          <span className={sectionLabel}>Platform configs</span>
          <ActionGroup>
            {platformKeys.map((key) => (
              <div className={rowClass} key={key}>
                <CodeIcon className={rowIcon} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
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
          </ActionGroup>
        </div>
      ) : null}
    </Panel>
  );
}
