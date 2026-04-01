"use client";

import { useEffect, useReducer } from "react";

import { CpuIcon, NodeIcon, PythonIcon, StopIcon, TerminalIcon, TimerIcon } from "@/components/frontier-icons";
import { Tip } from "@/components/ui/tip";
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
  creating: "Starting…",
  running: "Running",
  stopped: "Stopped",
  error: "Error",
};

const statusDotColor: Record<SandboxStatusBarProps["status"], string> = {
  idle: "bg-ink-faint/40",
  creating: "animate-pulse bg-warning",
  running: "bg-success",
  stopped: "bg-ink-faint/40",
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

  if (status === "idle" && !sandboxId) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-1 text-xs text-ink-faint/60",
          className,
        )}
      >
        <TerminalIcon className="h-3 w-3" />
        <span>Sandbox spins up on first message</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center gap-x-3 gap-y-1 border border-line bg-paper-2/50 px-3 py-2 text-xs text-ink-soft",
        "dark:bg-paper-2/40",
        className,
      )}
    >
      <Tip content={`Sandbox is ${statusLabel[status].toLowerCase()}`} side="top">
        <span
          aria-hidden
          className={cn(
            "inline-block h-2 w-2 shrink-0 rounded-full",
            statusDotColor[status],
          )}
        />
      </Tip>
      <span className="font-medium text-ink">{statusLabel[status]}</span>
      <span className="text-line-strong">·</span>
      <span className="flex items-center gap-1 text-ink-faint">
        {runtime.startsWith("python") ? (
          <PythonIcon className="h-3 w-3" />
        ) : (
          <NodeIcon className="h-3 w-3" />
        )}
        {runtime === "node24" ? "Node.js 24" : runtime === "python3.13" ? "Python 3.13" : runtime}
      </span>

      {sandboxId && (
        <>
          <span className="text-ink-faint/40">·</span>
          <Tip content={sandboxId} side="top">
            <span className="max-w-[80px] truncate font-mono text-ink-faint/70">
              {sandboxId}
            </span>
          </Tip>
        </>
      )}

      {status === "running" && uptimeSeconds > 0 && (
        <>
          <span className="text-ink-faint/40">·</span>
          <Tip content="Time before the sandbox auto-stops" side="top">
            <span className="flex items-center gap-1 font-mono tabular-nums text-ink-faint">
              <TimerIcon className="h-3 w-3" />
              {formatDuration(remaining)} left
            </span>
          </Tip>
        </>
      )}

      {status === "running" && processCount > 0 && (
        <>
          <span className="text-ink-faint/40">·</span>
          <Tip content="Active processes in the sandbox VM" side="top">
            <span className="flex items-center gap-1 tabular-nums text-ink-faint">
              <CpuIcon className="h-3 w-3" />
              {processCount} proc{processCount !== 1 ? "s" : ""}
            </span>
          </Tip>
        </>
      )}

      <div className="flex-1" />

      {status === "running" && onStop && (
        <Tip content="Terminate the sandbox session" side="top">
          <button
            className="flex h-6 items-center gap-1.5 border border-danger/20 bg-danger/[0.04] px-2 text-[0.625rem] font-medium text-danger transition-colors hover:border-danger/30 hover:bg-danger/[0.08] dark:bg-danger/[0.06]"
            onClick={onStop}
            type="button"
          >
            <StopIcon className="h-3 w-3" />
            Stop
          </button>
        </Tip>
      )}
    </div>
  );
}
