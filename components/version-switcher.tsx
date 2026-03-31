import Link from "next/link";

import { buildSkillVersionHref } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { VersionReference } from "@/lib/types";

type VersionSwitcherProps = {
  slug: string;
  currentVersion: number;
  versions: VersionReference[];
  className?: string;
};

export function VersionSwitcher({
  slug,
  currentVersion,
  versions,
  className,
}: VersionSwitcherProps) {
  if (versions.length <= 1) return null;

  return (
    <nav
      aria-label="Skill versions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {versions.map((v) => {
        const isCurrent = v.version === currentVersion;
        return (
          <Link
            className={cn(
              "inline-flex h-6 items-center rounded-full px-2.5 text-[0.6875rem] font-medium tabular-nums transition-colors",
              isCurrent
                ? "border border-accent bg-accent/10 text-accent"
                : "border border-line bg-paper-3 text-ink-faint hover:border-accent/50 hover:text-ink-soft"
            )}
            href={buildSkillVersionHref(slug, v.version)}
            key={v.version}
          >
            v{v.version}
          </Link>
        );
      })}
    </nav>
  );
}
