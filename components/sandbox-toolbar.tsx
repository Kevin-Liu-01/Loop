"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  NodeIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PythonIcon,
  SparkIcon,
} from "@/components/frontier-icons";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/shadcn/separator";
import { SkillIcon, McpIcon } from "@/components/ui/skill-icon";
import { Tip } from "@/components/ui/tip";
import { cn } from "@/lib/cn";
import { supportsSandboxMcp } from "@/lib/mcp-utils";
import {
  sandboxHeaderHeight,
  sandboxToolbarControl,
  sandboxToolbarLabel,
  sandboxContextCard,
  sandboxContextCardActive,
  sandboxEyebrow,
} from "@/lib/sandbox-ui";
import type {
  AgentProviderPreset,
  ImportedMcpDocument,
  SkillRecord,
} from "@/lib/types";

type SandboxRuntime = "node24" | "python3.13";

const RUNTIME_OPTIONS = [
  {
    icon: <NodeIcon className="h-3.5 w-3.5 text-ink-faint" />,
    label: "Node.js 24",
    value: "node24",
  },
  {
    icon: <PythonIcon className="h-3.5 w-3.5 text-ink-faint" />,
    label: "Python 3.13",
    value: "python3.13",
  },
];

export interface SandboxToolbarConfig {
  runtime: SandboxRuntime;
  providerId: string;
  model: string;
  apiKeyEnvVar: string;
  selectedSkillSlugs: string[];
  selectedMcpIds: string[];
}

interface SandboxToolbarProps {
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
    value: SandboxToolbarConfig[K]
  ) => void;
  onToggleSkill: (slug: string) => void;
  onToggleMcp: (id: string) => void;
}

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
    <Tip content={label} side="bottom">
      <button
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center text-ink-faint transition-colors hover:bg-paper-2/80 hover:text-ink",
          active && "bg-paper-3 text-ink ring-1 ring-line"
        )}
        onClick={onClick}
        type="button"
        aria-label={label}
      >
        {children}
      </button>
    </Tip>
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
    <div className="flex items-baseline gap-2 pb-2">
      <h3 className={cn("m-0", sandboxEyebrow)}>{label}</h3>
      <span className="text-[0.5rem] tabular-nums text-ink-faint/60">
        {count > 0 ? (
          <>
            <span className="font-semibold text-accent">{count}</span>
            <span className="mx-0.5 opacity-50">/</span>
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
  const executableMcps = mcps.filter((mcp) => supportsSandboxMcp(mcp));

  const [contextOpen, setContextOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedSkillCount = config.selectedSkillSlugs.length;
  const selectedMcpCount = config.selectedMcpIds.length;
  const totalSelected = selectedSkillCount + selectedMcpCount;

  const closeDropdown = useCallback(() => setContextOpen(false), []);

  useEffect(() => {
    if (!contextOpen) {
      return;
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        closeDropdown();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextOpen, closeDropdown]);

  return (
    <div className="relative shrink-0 border-b border-line bg-paper-2/30 dark:bg-paper-2/15">
      <div
        className={cn(
          sandboxHeaderHeight,
          "flex items-center gap-x-2.5 overflow-x-auto px-3 text-xs scrollbar-none sm:px-4"
        )}
      >
        <PanelToggle
          active={sidebarOpen}
          onClick={onToggleSidebar}
          label="Toggle sidebar"
        >
          <PanelLeftIcon className="h-3.5 w-3.5" />
        </PanelToggle>

        <Separator
          orientation="vertical"
          className="hidden h-3.5 opacity-30 sm:block"
        />

        <Tip content="Sandbox execution environment" side="bottom">
          <div className="flex items-center gap-1.5">
            <span className={cn(sandboxToolbarLabel, "hidden @[640px]:inline")}>
              Runtime
            </span>
            <Select
              className={cn(sandboxToolbarControl, "min-h-0 w-auto py-1")}
              onChange={(v) => onUpdateConfig("runtime", v as SandboxRuntime)}
              options={RUNTIME_OPTIONS}
              value={config.runtime}
            />
          </div>
        </Tip>

        <Tip content="AI gateway or custom provider" side="bottom">
          <div className="flex items-center gap-1.5">
            <span className={cn(sandboxToolbarLabel, "hidden @[640px]:inline")}>
              Provider
            </span>
            <Select
              className={cn(
                sandboxToolbarControl,
                "min-h-0 w-auto min-w-[7.5rem] py-1"
              )}
              onChange={(v) => {
                const preset = presets.find((p) => p.id === v);
                onUpdateConfig("providerId", v);
                if (preset) {
                  onUpdateConfig("model", preset.defaultModel);
                  onUpdateConfig("apiKeyEnvVar", preset.apiKeyEnvVar ?? "");
                }
              }}
              options={presets.map((p) => ({ label: p.label, value: p.id }))}
              value={config.providerId}
            />
          </div>
        </Tip>

        <Tip
          content="Gateway model ID – type or pick from suggestions"
          side="bottom"
        >
          <label className="flex min-w-0 items-center gap-1.5">
            <span className={cn(sandboxToolbarLabel, "hidden @[640px]:inline")}>
              Model
            </span>
            <input
              className={cn(
                sandboxToolbarControl,
                "min-w-0 w-28 @[640px]:w-40"
              )}
              onChange={(e) => onUpdateConfig("model", e.target.value)}
              placeholder={selectedPreset?.defaultModel}
              value={config.model}
            />
          </label>
        </Tip>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            ref={triggerRef}
            className={cn(
              "flex h-7 items-center gap-1.5 px-2 text-[0.625rem] font-medium text-ink-faint transition-colors",
              "border border-transparent hover:border-line hover:bg-paper-3 hover:text-ink",
              contextOpen && "border-accent/30 bg-accent/[0.06] text-accent"
            )}
            onClick={() => setContextOpen((p) => !p)}
            type="button"
            aria-expanded={contextOpen}
          >
            {totalSelected > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center bg-accent/12 px-1 text-[0.5rem] font-semibold tabular-nums text-accent">
                {totalSelected}
              </span>
            )}
            <SparkIcon className="h-3 w-3" />
            <span className="hidden @[640px]:inline">Context</span>
            {contextOpen ? (
              <ChevronUpIcon className="h-3 w-3 opacity-50" />
            ) : (
              <ChevronDownIcon className="h-3 w-3 opacity-50" />
            )}
          </button>

          <Separator
            orientation="vertical"
            className="hidden h-3.5 opacity-30 sm:block"
          />

          <PanelToggle
            active={inspectorOpen}
            onClick={onToggleInspector}
            label="Toggle VM inspector"
          >
            <PanelRightIcon className="h-3.5 w-3.5" />
          </PanelToggle>
        </div>
      </div>

      {/* Floating context dropdown */}
      {contextOpen &&
        createPortal(
          <ContextDropdown
            closeDropdown={closeDropdown}
            config={config}
            dropdownRef={dropdownRef}
            executableMcps={executableMcps}
            onToggleMcp={onToggleMcp}
            onToggleSkill={onToggleSkill}
            selectedMcpCount={selectedMcpCount}
            selectedSkillCount={selectedSkillCount}
            skills={skills}
            triggerRef={triggerRef}
          />,
          document.body
        )}
    </div>
  );
}

interface ContextDropdownProps {
  closeDropdown: () => void;
  config: SandboxToolbarConfig;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  executableMcps: ImportedMcpDocument[];
  onToggleMcp: (id: string) => void;
  onToggleSkill: (slug: string) => void;
  selectedMcpCount: number;
  selectedSkillCount: number;
  skills: SkillRecord[];
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

function ContextDropdown({
  closeDropdown,
  config,
  dropdownRef,
  executableMcps,
  onToggleMcp,
  onToggleSkill,
  selectedMcpCount,
  selectedSkillCount,
  skills,
  triggerRef,
}: ContextDropdownProps) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      setPos({
        right: window.innerWidth - rect.right,
        top: rect.bottom + 4,
      });
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [triggerRef]);

  if (!pos) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        aria-hidden
        onClick={closeDropdown}
      />

      <div
        ref={dropdownRef}
        className={cn(
          "fixed z-[9999] w-[min(560px,calc(100vw-2rem))]",
          "origin-top-right animate-in fade-in slide-in-from-top-1 duration-150",
          "overflow-hidden border border-line bg-paper-3/95 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] backdrop-blur-xl",
          "dark:bg-paper-3/90 dark:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.4)]"
        )}
        style={{ right: pos.right, top: pos.top }}
      >
        <div className="max-h-[min(50vh,420px)] overflow-y-auto overscroll-contain px-4 py-3.5">
          <ContextSectionHeader
            label="Skills"
            count={selectedSkillCount}
            total={skills.length}
          />
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {skills.slice(0, 24).map((skill) => {
              const active = config.selectedSkillSlugs.includes(skill.slug);
              return (
                <button
                  className={cn(
                    sandboxContextCard,
                    active && sandboxContextCardActive
                  )}
                  key={skill.slug}
                  onClick={() => onToggleSkill(skill.slug)}
                  type="button"
                >
                  <SkillIcon
                    slug={skill.slug}
                    iconUrl={skill.iconUrl}
                    size={15}
                    className="shrink-0"
                  />
                  <span className="min-w-0 truncate text-xs">
                    {skill.title}
                  </span>
                </button>
              );
            })}
          </div>

          {executableMcps.length > 0 && (
            <div className="mt-3 border-t border-line pt-3">
              <ContextSectionHeader
                label="MCPs"
                count={selectedMcpCount}
                total={executableMcps.length}
              />
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {executableMcps.slice(0, 24).map((mcp) => {
                  const active = config.selectedMcpIds.includes(mcp.id);
                  return (
                    <button
                      className={cn(
                        sandboxContextCard,
                        active && sandboxContextCardActive
                      )}
                      key={mcp.id}
                      onClick={() => onToggleMcp(mcp.id)}
                      type="button"
                    >
                      <McpIcon
                        name={mcp.name}
                        iconUrl={mcp.iconUrl}
                        homepageUrl={mcp.homepageUrl}
                        size={15}
                        className="shrink-0"
                      />
                      <span className="min-w-0 truncate text-xs">
                        {mcp.name}
                      </span>
                      <span className="ml-auto shrink-0 bg-paper-2/80 px-1.5 py-0.5 text-[0.55rem] font-medium text-ink-faint ring-1 ring-line dark:bg-paper-2">
                        {mcp.transport}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
