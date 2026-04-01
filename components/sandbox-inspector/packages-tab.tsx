"use client";

import { PackageIcon } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";
import type { PackageInfo } from "@/lib/sandbox-inspect-types";

type PackagesTabProps = {
  packages: PackageInfo[];
  isLoading: boolean;
};

export function PackagesTab({ packages, isLoading }: PackagesTabProps) {
  if (isLoading && packages.length === 0) {
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

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
        <PackageIcon className="h-5 w-5 text-ink-faint/30" />
        <p className="text-xs font-medium text-ink-faint/60">
          No packages installed.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="border border-line bg-paper-3">
        {packages.map((pkg, i) => (
          <div
            key={pkg.name}
            className={cn(
              "flex items-center justify-between gap-2 px-3 py-2 text-[0.8125rem] transition-colors hover:bg-paper-2/50",
              i < packages.length - 1 && "border-b border-line/60",
            )}
          >
            <span className="min-w-0 truncate font-medium text-ink">
              {pkg.name}
            </span>
            <span className="shrink-0 bg-paper-2/60 px-1.5 py-0.5 font-mono text-[0.625rem] tabular-nums text-ink-faint ring-1 ring-line dark:bg-paper-2">
              {pkg.version}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[0.5625rem] font-medium tabular-nums text-ink-faint/50">
        {packages.length} package{packages.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
