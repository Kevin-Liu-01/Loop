"use client";

import { StopIcon, TerminalIcon } from "@/components/frontier-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type SandboxStatusBarProps = {
  sandboxId: string | null;
  runtime: string;
  status: "idle" | "creating" | "running" | "stopped" | "error";
  onStop?: () => void;
  className?: string;
};

const statusLabel: Record<SandboxStatusBarProps["status"], string> = {
  idle: "No sandbox",
  creating: "Starting...",
  running: "Running",
  stopped: "Stopped",
  error: "Error"
};

const statusColor: Record<SandboxStatusBarProps["status"], string> = {
  idle: "bg-ink-faint",
  creating: "animate-pulse bg-warning",
  running: "bg-success",
  stopped: "bg-ink-faint",
  error: "bg-danger"
};

export function SandboxStatusBar({
  sandboxId,
  runtime,
  status,
  onStop,
  className
}: SandboxStatusBarProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center gap-2 border border-line/80 bg-paper-2/70 px-3 py-2.5 text-xs text-ink-soft shadow-sm ring-1 ring-ink/[0.03] dark:bg-paper-2/50 dark:ring-white/[0.05]",
        className
      )}
    >
      <span
        aria-hidden
        className={cn("inline-block h-2 w-2 shrink-0 rounded-full", statusColor[status])}
      />
      <span className="font-medium">{statusLabel[status]}</span>
      <span className="text-ink-faint">{runtime}</span>
      {sandboxId && (
        <span className="max-w-[120px] truncate font-mono text-ink-faint">
          {sandboxId}
        </span>
      )}
      <div className="flex-1" />
      {status === "running" && onStop && (
        <Button
          onClick={onStop}
          size="sm"
          type="button"
          variant="danger"
        >
          <StopIcon className="h-3 w-3" />
          Stop
        </Button>
      )}
      {!sandboxId && (
        <span className="flex items-center gap-1.5 text-ink-faint">
          <TerminalIcon className="h-3 w-3" />
          Sandbox auto-creates on first message
        </span>
      )}
    </div>
  );
}
