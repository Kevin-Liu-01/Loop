"use client";

import { CpuIcon, HardDriveIcon } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";
import type { MemoryInfo, DiskInfo } from "@/lib/sandbox-inspect-types";

type ResourcesTabProps = {
  memory: MemoryInfo;
  disk: DiskInfo;
  isLoading: boolean;
};

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
  const color =
    pct > 85 ? "bg-danger" : pct > 60 ? "bg-warning" : "bg-success";

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-ink-faint" />
        <span className="text-xs font-medium text-ink">{label}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-paper-2">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[0.6rem] tabular-nums text-ink-faint">
        <span>
          {used} {unit} / {total} {unit}
        </span>
        <span className="font-mono">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

export function ResourcesTab({ memory, disk, isLoading }: ResourcesTabProps) {
  if (isLoading && memory.totalMb === 0) {
    return (
      <div className="grid gap-4 p-3">
        {[0, 1].map((i) => (
          <div key={i} className="grid gap-2">
            <div className="h-4 w-20 animate-pulse rounded bg-paper-2/60" />
            <div className="h-2 animate-pulse rounded-full bg-paper-2/60" />
            <div className="h-3 w-32 animate-pulse rounded bg-paper-2/60" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-4">
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
