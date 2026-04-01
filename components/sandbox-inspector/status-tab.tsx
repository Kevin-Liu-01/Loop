"use client";

import { useEffect, useReducer } from "react";

import { NodeIcon, PythonIcon, TerminalIcon, TimerIcon } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";
import { sandboxEyebrow } from "@/lib/sandbox-ui";

type StatusTabProps = {
  sandboxId: string | null;
  runtime: string;
  uptimeSeconds: number;
  timeoutMs: number;
  runtimeVersion: string;
  sandboxState: string;
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function StatusRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line/60 px-3 py-2.5 first:border-t-0">
      <span className={sandboxEyebrow}>{label}</span>
      <span
        className={cn(
          "text-right text-sm font-medium text-ink",
          mono && "font-mono tabular-nums",
        )}
      >
        {value}
      </span>
    </div>
  );
}

const stateColors: Record<string, string> = {
  idle: "bg-ink-faint/40",
  creating: "animate-pulse bg-warning",
  running: "bg-success",
  stopped: "bg-ink-faint/40",
  error: "bg-danger",
};

export function StatusTab({
  sandboxId,
  runtime,
  uptimeSeconds,
  timeoutMs,
  runtimeVersion,
  sandboxState,
}: StatusTabProps) {
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (sandboxState !== "running") return;
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [sandboxState]);

  const timeoutSec = timeoutMs / 1000;
  const remaining = Math.max(0, timeoutSec - uptimeSeconds);
  const remainingPct = timeoutSec > 0 ? (remaining / timeoutSec) * 100 : 0;

  return (
    <div className="grid gap-4 p-4">
      {/* State badge */}
      <div className="flex items-center gap-2.5 border border-line bg-paper-3 px-3 py-2.5">
        <span
          className={cn(
            "inline-block h-2 w-2 rounded-full",
            stateColors[sandboxState] ?? "bg-ink-faint/40",
          )}
        />
        <span className="text-sm font-semibold capitalize text-ink">
          {sandboxState}
        </span>
        {sandboxState === "running" && uptimeSeconds > 0 && (
          <span className="ml-auto font-mono text-xs tabular-nums text-ink-faint">
            {formatDuration(uptimeSeconds)}
          </span>
        )}
      </div>

      {/* Timeout remaining bar */}
      {sandboxState === "running" && (
        <div className="grid gap-2 border border-line bg-paper-3 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TimerIcon className="h-3 w-3 text-ink-faint" />
              <span className={sandboxEyebrow}>Time remaining</span>
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums text-ink">
              {formatDuration(remaining)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden bg-line/30 dark:bg-line/20">
            <div
              className={cn(
                "h-full transition-all duration-1000",
                remainingPct > 25
                  ? "bg-success"
                  : remainingPct > 10
                    ? "bg-warning"
                    : "bg-danger",
              )}
              style={{ width: `${remainingPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Detail rows */}
      <div className="border border-line bg-paper-3">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <span className={sandboxEyebrow}>Runtime</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            {runtime.startsWith("python") ? (
              <PythonIcon className="h-3.5 w-3.5 text-ink-faint" />
            ) : (
              <NodeIcon className="h-3.5 w-3.5 text-ink-faint" />
            )}
            {runtime === "node24" ? "Node.js 24" : runtime === "python3.13" ? "Python 3.13" : runtime}
          </span>
        </div>
        {runtimeVersion && (
          <StatusRow label="Version" value={runtimeVersion} mono />
        )}
        {sandboxId && (
          <StatusRow
            label="Sandbox ID"
            value={sandboxId.slice(0, 16) + "…"}
            mono
          />
        )}
      </div>

      {/* Empty state */}
      {sandboxState === "idle" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center border border-line bg-paper-3">
            <TerminalIcon className="h-5 w-5 text-ink-faint/30" />
          </div>
          <div className="grid gap-1">
            <p className="text-sm font-medium text-ink-faint">
              No active sandbox
            </p>
            <p className="text-xs text-ink-faint/60">
              Send a message to spin one up.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
