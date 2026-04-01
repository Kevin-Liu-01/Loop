"use client";

import { CpuIcon } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";
import type { ProcessInfo } from "@/lib/sandbox-inspect-types";

type ProcessesTabProps = {
  processes: ProcessInfo[];
  isLoading: boolean;
};

function ProcessRow({ proc }: { proc: ProcessInfo }) {
  return (
    <tr className="group border-b border-line/60 text-[0.6875rem] transition-colors last:border-b-0 hover:bg-paper-2/50">
      <td className="px-3 py-2 font-mono tabular-nums text-ink-faint">
        {proc.pid}
      </td>
      <td className="max-w-[120px] truncate px-3 py-2 font-medium text-ink">
        {proc.name}
      </td>
      <td
        className={cn(
          "px-3 py-2 text-right font-mono tabular-nums",
          proc.cpuPercent > 50
            ? "font-semibold text-danger"
            : proc.cpuPercent > 20
              ? "text-warning"
              : "text-ink-faint",
        )}
      >
        {proc.cpuPercent.toFixed(1)}%
      </td>
      <td
        className={cn(
          "px-3 py-2 text-right font-mono tabular-nums",
          proc.memPercent > 50
            ? "font-semibold text-danger"
            : proc.memPercent > 20
              ? "text-warning"
              : "text-ink-faint",
        )}
      >
        {proc.memPercent.toFixed(1)}%
      </td>
    </tr>
  );
}

export function ProcessesTab({ processes, isLoading }: ProcessesTabProps) {
  if (isLoading && processes.length === 0) {
    return (
      <div className="grid gap-0 p-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-8 animate-pulse border-b border-line/60 bg-paper-2/30"
          />
        ))}
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
        <CpuIcon className="h-5 w-5 text-ink-faint/30" />
        <p className="text-xs font-medium text-ink-faint/60">
          No processes running.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="overflow-hidden border border-line bg-paper-3">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-paper-2/40 text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint dark:bg-paper-2/30">
              <th className="px-3 py-2 font-semibold">PID</th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 text-right font-semibold">CPU</th>
              <th className="px-3 py-2 text-right font-semibold">MEM</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((proc) => (
              <ProcessRow key={proc.pid} proc={proc} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2.5 text-[0.5625rem] font-medium tabular-nums text-ink-faint/50">
        {processes.length} process{processes.length !== 1 ? "es" : ""}
      </p>
    </div>
  );
}
