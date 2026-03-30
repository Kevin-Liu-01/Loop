"use client";

import { useEffect, useReducer } from "react";

import { CpuIcon, StopIcon, TerminalIcon, TimerIcon } from "@/components/frontier-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type SandboxStatusBarProps = {
  sandboxId: string | null;
  runtime: string;
  status: "idle" | "creating" | "running" | "stopped" | "error";
  uptimeSeconds?: number;
  timeoutMs?: number;
  processCount?: number;
  onStop?: () => void;
  className?: string;
};

const statusLabel: Record<SandboxStatusBarProps["status"], string> = {
  idle: "No sandbox",
  creating: "Starting...",
  running: "Running",
  stopped: "Stopped",
  error: "Error",
};

const statusColor: Record<SandboxStatusBarProps["status"], string> = {
  idle: "bg-ink-faint",
  creating: "animate-pulse bg-warning",
  running: "bg-success",
  stopped: "bg-ink-faint",
  error: "bg-danger",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function SandboxStatusBar({
  sandboxId,
  runtime,
  status,
  uptimeSeconds = 0,
  timeoutMs = 120_000,
  processCount = 0,
  onStop,
  className,
}: SandboxStatusBarProps) {
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [status]);

  const timeoutSec = timeoutMs / 1000;
  const remaining = Math.max(0, timeoutSec - uptimeSeconds);

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center gap-3 rounded-lg border border-line/80 bg-paper-2/70 px-4 py-3 text-xs text-ink-soft shadow-sm ring-1 ring-ink/[0.03] dark:bg-paper-2/50 dark:ring-white/[0.05]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-2 w-2 shrink-0 rounded-full",
          statusColor[status],
        )}
      />
      <span className="font-medium">{statusLabel[status]}</span>
      <span className="text-ink-faint">{runtime}</span>

      {sandboxId && (
        <span className="max-w-[100px] truncate font-mono text-ink-faint">
          {sandboxId}
        </span>
      )}

      {/* Uptime + time remaining */}
      {status === "running" && uptimeSeconds > 0 && (
        <>
          <span className="text-ink-faint/40" aria-hidden>|</span>
          <span className="flex items-center gap-1 font-mono tabular-nums text-ink-faint">
            <TimerIcon className="h-3 w-3" />
            {formatDuration(remaining)} left
          </span>
        </>
      )}

      {/* Process count */}
      {status === "running" && processCount > 0 && (
        <>
          <span className="text-ink-faint/40" aria-hidden>|</span>
          <span className="flex items-center gap-1 font-mono tabular-nums text-ink-faint">
            <CpuIcon className="h-3 w-3" />
            {processCount} proc{processCount !== 1 ? "s" : ""}
          </span>
        </>
      )}

      <div className="flex-1" />

      {status === "running" && onStop && (
        <Button onClick={onStop} size="sm" type="button" variant="danger">
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
