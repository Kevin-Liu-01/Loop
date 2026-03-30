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
    <tr className="border-b border-line/30 text-[0.65rem] last:border-b-0">
      <td className="py-1.5 pr-2 font-mono tabular-nums text-ink-faint">
        {proc.pid}
      </td>
      <td className="max-w-[120px] truncate py-1.5 pr-2 text-ink">
        {proc.name}
      </td>
      <td
        className={cn(
          "py-1.5 pr-2 text-right font-mono tabular-nums",
          proc.cpuPercent > 50 ? "text-danger" : proc.cpuPercent > 20 ? "text-warning" : "text-ink-soft",
        )}
      >
        {proc.cpuPercent.toFixed(1)}%
      </td>
      <td
        className={cn(
          "py-1.5 text-right font-mono tabular-nums",
          proc.memPercent > 50 ? "text-danger" : proc.memPercent > 20 ? "text-warning" : "text-ink-soft",
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
      <div className="grid gap-2 p-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-6 animate-pulse rounded bg-paper-2/60" />
        ))}
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
        <CpuIcon className="h-5 w-5 text-ink-faint/50" />
        <p className="text-xs text-ink-faint">No processes running.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-line/50 text-[0.6rem] font-medium uppercase tracking-[0.06em] text-ink-faint">
            <th className="pb-1.5 pr-2 font-medium">PID</th>
            <th className="pb-1.5 pr-2 font-medium">Name</th>
            <th className="pb-1.5 pr-2 text-right font-medium">CPU</th>
            <th className="pb-1.5 text-right font-medium">MEM</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((proc) => (
            <ProcessRow key={proc.pid} proc={proc} />
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[0.55rem] tabular-nums text-ink-faint">
        {processes.length} process{processes.length !== 1 ? "es" : ""}
      </p>
    </div>
  );
}
