"use client";

import { useState } from "react";

import {
  CpuIcon,
  FileIcon,
  HardDriveIcon,
  PackageIcon,
  PulseIcon,
  RefreshIcon,
} from "@/components/frontier-icons";
import { StatusTab } from "@/components/sandbox-inspector/status-tab";
import { ProcessesTab } from "@/components/sandbox-inspector/processes-tab";
import { FilesTab } from "@/components/sandbox-inspector/files-tab";
import { ResourcesTab } from "@/components/sandbox-inspector/resources-tab";
import { PackagesTab } from "@/components/sandbox-inspector/packages-tab";
import { Tip } from "@/components/ui/tip";
import { cn } from "@/lib/cn";
import { sandboxHeaderHeight, sandboxHeaderBase, sandboxEyebrow } from "@/lib/sandbox-ui";
import type { SandboxInspectResponse } from "@/lib/sandbox-inspect-types";

const TAB_DESCRIPTIONS: Record<string, string> = {
  status: "Sandbox lifecycle and uptime",
  processes: "Running processes in the VM",
  files: "Browse the sandbox filesystem",
  resources: "Memory and disk usage",
  packages: "Installed packages and versions",
};

type InspectorTab = "status" | "processes" | "files" | "resources" | "packages";

type SandboxInspectorProps = {
  sandboxId: string | null;
  runtime: string;
  sandboxState: string;
  data: SandboxInspectResponse | null;
  isLoading: boolean;
  error: string | null;
  currentPath: string;
  onRefresh: () => void;
  onBrowsePath: (path: string) => void;
};

const TABS: Array<{
  id: InspectorTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "status", label: "Status", icon: PulseIcon },
  { id: "processes", label: "Procs", icon: CpuIcon },
  { id: "files", label: "Files", icon: FileIcon },
  { id: "resources", label: "Res", icon: HardDriveIcon },
  { id: "packages", label: "Pkgs", icon: PackageIcon },
];

const emptyData: SandboxInspectResponse = {
  sandboxId: "",
  uptimeSeconds: 0,
  timeoutMs: 120_000,
  runtimeVersion: "",
  memory: { totalMb: 0, usedMb: 0, freeMb: 0 },
  disk: { totalMb: 0, usedMb: 0, freeMb: 0 },
  processes: [],
  files: [],
  packages: [],
};

export function SandboxInspector({
  sandboxId,
  runtime,
  sandboxState,
  data,
  isLoading,
  error,
  currentPath,
  onRefresh,
  onBrowsePath,
}: SandboxInspectorProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("status");
  const d = data ?? emptyData;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      {/* Header */}
      <div className={cn(sandboxHeaderBase, sandboxHeaderHeight, "justify-between")}>
        <div className="flex items-center gap-2">
          <CpuIcon className="h-3.5 w-3.5 text-accent" />
          <span className={sandboxEyebrow}>VM Inspector</span>
        </div>
        <Tip content="Refresh inspector data" side="left">
          <button
            className="flex h-7 w-7 items-center justify-center text-ink-faint transition-colors hover:bg-paper-2/80 hover:text-ink"
            onClick={onRefresh}
            type="button"
            aria-label="Refresh inspector"
          >
            <RefreshIcon
              className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
            />
          </button>
        </Tip>
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 items-center border-b border-line">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <Tip
              content={TAB_DESCRIPTIONS[tab.id] ?? tab.label}
              side="bottom"
              key={tab.id}
            >
              <button
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2 text-[0.625rem] font-medium transition-colors",
                  active
                    ? "border-accent text-accent"
                    : "border-transparent text-ink-faint/60 hover:text-ink-soft",
                )}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            </Tip>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {error && (
          <div className="border-b border-danger/15 bg-danger/[0.04] px-4 py-2.5 text-xs font-medium text-danger">
            {error}
          </div>
        )}

        {activeTab === "status" && (
          <StatusTab
            sandboxId={sandboxId}
            runtime={runtime}
            uptimeSeconds={d.uptimeSeconds}
            timeoutMs={d.timeoutMs}
            runtimeVersion={d.runtimeVersion}
            sandboxState={sandboxState}
          />
        )}
        {activeTab === "processes" && (
          <ProcessesTab processes={d.processes} isLoading={isLoading} />
        )}
        {activeTab === "files" && (
          <FilesTab
            files={d.files}
            currentPath={currentPath}
            isLoading={isLoading}
            onBrowse={onBrowsePath}
          />
        )}
        {activeTab === "resources" && (
          <ResourcesTab
            memory={d.memory}
            disk={d.disk}
            isLoading={isLoading}
          />
        )}
        {activeTab === "packages" && (
          <PackagesTab packages={d.packages} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
