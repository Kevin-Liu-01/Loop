"use client";

import { CpuIcon, HardDriveIcon } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";
import type { MemoryInfo, DiskInfo } from "@/lib/sandbox-inspect-types";
import { sandboxEyebrow } from "@/lib/sandbox-ui";

interface ResourcesTabProps {
  memory: MemoryInfo;
  disk: DiskInfo;
  isLoading: boolean;
}

function GaugeBar({
  label,
  icon: Icon,
  used,
  total,
  unit,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  used: number;
  total: number;
  unit: string;
}) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const color = pct > 85 ? "bg-danger" : pct > 60 ? "bg-warning" : "bg-accent";

  return (
    <div className="grid gap-2.5 border border-line bg-paper-3 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-ink-faint" />
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="ml-auto font-mono text-xs font-semibold tabular-nums text-ink-soft">
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden bg-line/25 dark:bg-line/15">
        <div
          className={cn("h-full transition-all duration-700 ease-out", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between font-mono text-[0.5625rem] tabular-nums text-ink-faint/60">
        <span>
          {used} {unit} used
        </span>
        <span>
          {total} {unit} total
        </span>
      </div>
    </div>
  );
}

export function ResourcesTab({ memory, disk, isLoading }: ResourcesTabProps) {
  if (isLoading && memory.totalMb === 0) {
    return (
      <div className="grid gap-3 p-4">
        {[0, 1].map((i) => (
          <div key={i} className="grid gap-2 border border-line p-3">
            <div className="h-4 w-20 animate-pulse bg-paper-2/40" />
            <div className="h-1.5 animate-pulse bg-paper-2/40" />
            <div className="h-3 w-32 animate-pulse bg-paper-2/40" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-4">
      <GaugeBar
        label="Memory"
        icon={CpuIcon}
        used={memory.usedMb}
        total={memory.totalMb}
        unit="MB"
      />
      <GaugeBar
        label="Disk"
        icon={HardDriveIcon}
        used={disk.usedMb}
        total={disk.totalMb}
        unit="MB"
      />
    </div>
  );
}
