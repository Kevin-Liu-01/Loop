"use client";

import { useState } from "react";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  PanelLeftIcon,
  PanelRightIcon,
} from "@/components/frontier-icons";
import { SkillIcon, McpIcon } from "@/components/ui/skill-icon";
import { Separator } from "@/components/ui/shadcn/separator";
import { cn } from "@/lib/cn";
import {
  sandboxToolbarControl,
  sandboxToolbarLabel,
  sandboxContextCard,
  sandboxContextCardActive,
} from "@/lib/sandbox-ui";
import type {
  AgentProviderPreset,
  ImportedMcpDocument,
  SkillRecord,
} from "@/lib/types";

type SandboxRuntime = "node24" | "python3.13";

export type SandboxToolbarConfig = {
  runtime: SandboxRuntime;
  providerId: string;
  model: string;
  apiKeyEnvVar: string;
  selectedSkillSlugs: string[];
  selectedMcpIds: string[];
};

type SandboxToolbarProps = {
  config: SandboxToolbarConfig;
  presets: AgentProviderPreset[];
  skills: SkillRecord[];
  mcps: ImportedMcpDocument[];
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  onToggleSidebar: () => void;
  onToggleInspector: () => void;
  onUpdateConfig: <K extends keyof SandboxToolbarConfig>(
    key: K,
    value: SandboxToolbarConfig[K],
  ) => void;
  onToggleSkill: (slug: string) => void;
  onToggleMcp: (id: string) => void;
};

function PanelToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-ink-soft transition-colors hover:border-line/80 hover:bg-paper-3 hover:text-ink",
        active && "border-line/60 bg-paper-3/60 text-ink",
      )}
      onClick={onClick}
      type="button"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function ContextSectionHeader({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  return (
    <div className="flex items-baseline gap-2.5 pb-3">
      <h3 className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-soft">
        {label}
      </h3>
      <span className="font-mono text-[0.6rem] tabular-nums text-ink-faint">
        {count > 0 ? (
          <>
            <span className="text-accent">{count}</span>
            <span className="mx-0.5">/</span>
            {total}
          </>
        ) : (
          total
        )}
      </span>
    </div>
  );
}

export function SandboxToolbar({
  config,
  presets,
  skills,
  mcps,
  sidebarOpen,
  inspectorOpen,
  onToggleSidebar,
  onToggleInspector,
  onUpdateConfig,
  onToggleSkill,
  onToggleMcp,
}: SandboxToolbarProps) {
  const selectedPreset = presets.find((p) => p.id === config.providerId);
  const executableMcps = mcps.filter(
    (m) => m.transport === "stdio" || m.transport === "http",
  );

  const [contextExpanded, setContextExpanded] = useState(true);
  const selectedSkillCount = config.selectedSkillSlugs.length;
  const selectedMcpCount = config.selectedMcpIds.length;
  const totalSelected = selectedSkillCount + selectedMcpCount;

  return (
    <div className="shrink-0 border-b border-line/80 bg-linear-to-b from-paper-2/55 to-transparent dark:from-paper-2/30">
      {/* Row 1: panel toggles + runtime/provider/model */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 sm:px-6">
        <PanelToggle
          active={sidebarOpen}
          onClick={onToggleSidebar}
          label="Toggle sidebar"
        >
          <PanelLeftIcon className="h-4 w-4" />
        </PanelToggle>

        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        <label className="flex items-center gap-2.5">
          <span className={sandboxToolbarLabel}>Runtime</span>
          <select
            className={sandboxToolbarControl}
            onChange={(e) =>
              onUpdateConfig("runtime", e.target.value as SandboxRuntime)
            }
            value={config.runtime}
          >
            <option value="node24">Node.js 24</option>
            <option value="python3.13">Python 3.13</option>
          </select>
        </label>

        <label className="flex items-center gap-2.5">
          <span className={sandboxToolbarLabel}>Provider</span>
          <select
            className={cn(sandboxToolbarControl, "min-w-[7.5rem]")}
            onChange={(e) => {
              const preset = presets.find((p) => p.id === e.target.value);
              onUpdateConfig("providerId", e.target.value);
              if (preset) {
                onUpdateConfig("model", preset.defaultModel);
                onUpdateConfig("apiKeyEnvVar", preset.apiKeyEnvVar ?? "");
              }
            }}
            value={config.providerId}
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-1 items-center gap-2.5 sm:max-w-[min(100%,18rem)] sm:flex-initial">
          <span className={sandboxToolbarLabel}>Model</span>
          <input
            className={cn(
              sandboxToolbarControl,
              "min-w-0 flex-1 font-mono sm:w-56",
            )}
            onChange={(e) => onUpdateConfig("model", e.target.value)}
            placeholder={selectedPreset?.defaultModel}
            value={config.model}
          />
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button
            className={cn(
              "flex h-8 items-center gap-2 rounded-md border border-transparent px-2.5 text-xs font-medium text-ink-faint transition-colors hover:border-line/60 hover:bg-paper-3 hover:text-ink",
              contextExpanded && "border-line/40 bg-paper-3/40 text-ink-soft",
            )}
            onClick={() => setContextExpanded((p) => !p)}
            type="button"
          >
            {totalSelected > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/15 px-1.5 font-mono text-[0.6rem] tabular-nums text-accent">
                {totalSelected}
              </span>
            )}
            Context
            {contextExpanded ? (
              <ChevronUpIcon className="h-3 w-3" />
            ) : (
              <ChevronDownIcon className="h-3 w-3" />
            )}
          </button>

          <Separator orientation="vertical" className="hidden h-5 sm:block" />

          <PanelToggle
            active={inspectorOpen}
            onClick={onToggleInspector}
            label="Toggle VM inspector"
          >
            <PanelRightIcon className="h-4 w-4" />
          </PanelToggle>
        </div>
      </div>

      {/* Collapsible context: skills + MCPs in scrollable grid */}
      {contextExpanded && (
        <div className="max-h-[min(45vh,420px)] overflow-y-auto overscroll-contain border-t border-line/50 px-5 py-4 sm:px-6">
          {/* Skills */}
          <ContextSectionHeader
            label="Skills"
            count={selectedSkillCount}
            total={skills.length}
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {skills.slice(0, 24).map((skill) => {
              const active = config.selectedSkillSlugs.includes(skill.slug);
              return (
                <button
                  className={cn(
                    sandboxContextCard,
                    active && sandboxContextCardActive,
                  )}
                  key={skill.slug}
                  onClick={() => onToggleSkill(skill.slug)}
                  type="button"
                >
                  <SkillIcon
                    slug={skill.slug}
                    iconUrl={skill.iconUrl}
                    size={18}
                    className="shrink-0"
                  />
                  <span className="min-w-0 truncate">{skill.title}</span>
                </button>
              );
            })}
          </div>

          {/* MCPs */}
          {executableMcps.length > 0 && (
            <div className="mt-5 border-t border-line/30 pt-5">
              <ContextSectionHeader
                label="MCPs"
                count={selectedMcpCount}
                total={executableMcps.length}
              />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {executableMcps.slice(0, 24).map((mcp) => {
                  const active = config.selectedMcpIds.includes(mcp.id);
                  return (
                    <button
                      className={cn(
                        sandboxContextCard,
                        active && sandboxContextCardActive,
                      )}
                      key={mcp.id}
                      onClick={() => onToggleMcp(mcp.id)}
                      type="button"
                    >
                      <McpIcon
                        name={mcp.name}
                        iconUrl={mcp.iconUrl}
                        homepageUrl={mcp.homepageUrl}
                        size={18}
                        className="shrink-0"
                      />
                      <span className="min-w-0 truncate">{mcp.name}</span>
                      <span className="ml-auto shrink-0 text-[0.6rem] text-ink-faint">
                        {mcp.transport}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
