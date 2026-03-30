"use client";

import { PackageIcon } from "@/components/frontier-icons";
import type { PackageInfo } from "@/lib/sandbox-inspect-types";

type PackagesTabProps = {
  packages: PackageInfo[];
  isLoading: boolean;
};

export function PackagesTab({ packages, isLoading }: PackagesTabProps) {
  if (isLoading && packages.length === 0) {
    return (
      <div className="grid gap-2 p-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-5 animate-pulse rounded bg-paper-2/60" />
        ))}
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
        <PackageIcon className="h-5 w-5 text-ink-faint/50" />
        <p className="text-xs text-ink-faint">No packages installed.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-0 p-4">
      <div className="grid gap-0.5">
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            className="flex items-center justify-between gap-2 rounded py-1 text-[0.7rem]"
          >
            <span className="min-w-0 truncate text-ink">{pkg.name}</span>
            <span className="shrink-0 font-mono text-[0.6rem] tabular-nums text-ink-faint">
              {pkg.version}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.55rem] tabular-nums text-ink-faint">
        {packages.length} package{packages.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
