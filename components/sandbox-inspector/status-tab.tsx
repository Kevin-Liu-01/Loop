"use client";

import { useEffect, useReducer } from "react";

import { ClockIcon, TerminalIcon, TimerIcon } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";

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
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.06em] text-ink-faint">
        {label}
      </span>
      <span
        className={cn(
          "text-right text-xs text-ink",
          mono && "font-mono tabular-nums",
        )}
      >
        {value}
      </span>
    </div>
  );
}

const stateColors: Record<string, string> = {
  idle: "bg-ink-faint",
  creating: "animate-pulse bg-warning",
  running: "bg-success",
  stopped: "bg-ink-faint",
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
    <div className="grid gap-5 p-4">
      {/* State badge */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full",
            stateColors[sandboxState] ?? "bg-ink-faint",
          )}
        />
        <span className="text-sm font-medium capitalize text-ink">
          {sandboxState}
        </span>
      </div>

      {/* Timeout remaining bar */}
      {sandboxState === "running" && (
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TimerIcon className="h-3 w-3 text-ink-faint" />
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.06em] text-ink-faint">
                Time remaining
              </span>
            </div>
            <span className="font-mono text-xs tabular-nums text-ink">
              {formatDuration(remaining)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-2">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                remainingPct > 25 ? "bg-success" : remainingPct > 10 ? "bg-warning" : "bg-danger",
              )}
              style={{ width: `${remainingPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Detail rows */}
      <div className="grid divide-y divide-line/40">
        <StatusRow label="Runtime" value={runtime} />
        {runtimeVersion && (
          <StatusRow label="Version" value={runtimeVersion} mono />
        )}
        {sandboxId && (
          <StatusRow label="Sandbox ID" value={sandboxId.slice(0, 16) + "..."} mono />
        )}
        {uptimeSeconds > 0 && (
          <StatusRow label="Uptime" value={formatDuration(uptimeSeconds)} mono />
        )}
      </div>

      {/* Empty state */}
      {sandboxState === "idle" && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <TerminalIcon className="h-7 w-7 text-ink-faint/40" />
          <p className="text-sm leading-relaxed text-ink-faint">
            No active sandbox.
            <br />
            Send a message to spin one up.
          </p>
        </div>
      )}
    </div>
  );
}
