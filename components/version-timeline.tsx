import Link from "next/link";

import { TagIcon } from "@/components/frontier-icons";
import { buildSkillVersionHref, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { VersionReference } from "@/lib/types";

type VersionTimelineProps = {
  slug: string;
  currentVersion: number;
  versions: VersionReference[];
  hrefBuilder?: (slug: string, version: number) => string;
  timeZone?: string;
};

export function VersionTimeline({
  slug,
  currentVersion,
  versions,
  hrefBuilder = buildSkillVersionHref,
  timeZone,
}: VersionTimelineProps) {
  return (
    <nav className="grid gap-0">
      <h3 className="mb-2 flex items-center gap-1.5 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-ink-faint">
        <TagIcon className="h-3 w-3" />
        Versions
      </h3>
      <div className="grid gap-0">
        {versions.map((v) => {
          const isCurrent = v.version === currentVersion;
          return (
            <Link
              className={cn(
                "flex min-w-0 items-baseline justify-between gap-3 border-l-2 py-1.5 pl-3 pr-1 text-sm transition-colors",
                isCurrent
                  ? "border-accent font-semibold text-ink"
                  : "border-line text-ink-soft hover:border-ink-faint hover:text-ink"
              )}
              href={hrefBuilder(slug, v.version)}
              key={v.version}
            >
              <span className="truncate">{v.label}</span>
              <span className="shrink-0 text-[0.6875rem] tabular-nums text-ink-faint">
                {formatRelativeDate(v.updatedAt, timeZone)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
