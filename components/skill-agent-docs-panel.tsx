"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Image from "next/image";

import { CopyButton } from "@/components/copy-button";
import { CodeIcon, FileCodeIcon } from "@/components/frontier-icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";
import { getPlatformDocIcon } from "@/lib/skill-icons";
import type { AgentDocs } from "@/lib/types";

type SkillAgentDocsPanelProps = {
  agentDocs?: AgentDocs;
  skillSlug: string;
  skillHref: string;
};

const KNOWN_DOC_LABELS: Record<string, string> = {
  agents: "AGENTS.md",
  cursor: "CURSOR.md",
  claude: "CLAUDE.md",
  codex: "CODEX.md",
};

function docLabel(key: string): string {
  return KNOWN_DOC_LABELS[key] ?? `${key.toUpperCase()}.md`;
}

function PlatformDocTabIcon({ docKey }: { docKey: string }) {
  const brand = getPlatformDocIcon(docKey);
  if (brand) {
    return (
      <Image
        src={brand.src}
        alt={brand.alt}
        width={14}
        height={14}
        className="shrink-0 dark:invert"
        unoptimized
      />
    );
  }
  return <CodeIcon className="h-3 w-3" />;
}

export function SkillAgentDocsPanel({ agentDocs, skillSlug, skillHref }: SkillAgentDocsPanelProps) {
  const entries = Object.entries(agentDocs ?? {}).filter(
    ([, content]) => typeof content === "string" && content.trim().length > 0
  ) as [string, string][];

  const [activeTab, setActiveTab] = useState<string>(entries[0]?.[0] ?? "");

  if (entries.length === 0) return null;

  const activeContent = agentDocs?.[activeTab] ?? "";

  return (
    <section className="grid gap-4 border-t border-line pt-8" id="agent-docs">
      <SectionHeading
        icon={<FileCodeIcon />}
        title="Agent docs"
        count={entries.length}
        countLabel="attached"
      />

      <div className="overflow-hidden rounded-none border border-line bg-paper-3/92">
        <div className="flex items-center justify-between border-b border-line bg-paper-2/60 dark:bg-paper-2/30">
          <div className="flex min-w-0 overflow-x-auto">
            {entries.map(([key]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors",
                  activeTab === key
                    ? "border-accent bg-paper-3/80 text-accent dark:bg-paper-3/40"
                    : "border-transparent text-ink-soft hover:bg-paper-3/50 hover:text-ink dark:hover:bg-paper-3/20"
                )}
              >
                <PlatformDocTabIcon docKey={key} />
                {docLabel(key)}
              </button>
            ))}
          </div>
          <div className="shrink-0 px-3">
            <CopyButton
              className="text-xs"
              iconSize="sm"
              label="Copy"
              size="sm"
              usageEvent={{
                kind: "copy_agent_doc",
                label: `Copied ${docLabel(activeTab)}`,
                path: skillHref,
                skillSlug,
              }}
              value={activeContent}
              variant="soft"
            />
          </div>
        </div>

        <div className="markdown-shell markdown-shell--agent-doc p-5 sm:p-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {activeContent}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
