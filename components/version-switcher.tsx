"use client";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { cn } from "@/lib/cn";
import { buildSkillVersionHref } from "@/lib/format";
import type { VersionReference } from "@/lib/types";

const MAX_VISIBLE = 5;

interface VersionSwitcherProps {
  slug: string;
  currentVersion: number;
  versions: VersionReference[];
  className?: string;
}

function pillClass(active: boolean) {
  return cn(
    "inline-flex h-6 items-center rounded-full px-2.5 text-[0.6875rem] font-medium tabular-nums transition-colors",
    active
      ? "border border-accent bg-accent/10 text-accent"
      : "border border-line bg-paper-3 text-ink-faint hover:border-accent/50 hover:text-ink-soft"
  );
}

function splitVersions(
  versions: VersionReference[],
  currentVersion: number
): { visible: VersionReference[]; overflow: VersionReference[] } {
  if (versions.length <= MAX_VISIBLE) {
    return { visible: versions, overflow: [] };
  }

  const visible = versions.slice(0, MAX_VISIBLE);
  const overflow = versions.slice(MAX_VISIBLE);

  const currentInVisible = visible.some((v) => v.version === currentVersion);
  if (!currentInVisible) {
    const currentRef = overflow.find((v) => v.version === currentVersion);
    if (currentRef) {
      visible[MAX_VISIBLE - 1] = currentRef;
      overflow.splice(overflow.indexOf(currentRef), 1);
      overflow.unshift(versions[MAX_VISIBLE - 1]);
    }
  }

  return { visible, overflow };
}

export function VersionSwitcher({
  slug,
  currentVersion,
  versions,
  className,
}: VersionSwitcherProps) {
  if (versions.length <= 1) {
    return null;
  }

  const { visible, overflow } = splitVersions(versions, currentVersion);

  return (
    <nav
      aria-label="Skill versions"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {visible.map((v) => (
        <Link
          className={pillClass(v.version === currentVersion)}
          href={buildSkillVersionHref(slug, v.version)}
          key={v.version}
        >
          v{v.version}
        </Link>
      ))}

      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(pillClass(false), "cursor-pointer select-none")}
              type="button"
            >
              +{overflow.length}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-0">
            {overflow.map((v) => (
              <DropdownMenuItem asChild key={v.version}>
                <Link
                  className={cn(
                    "flex items-center gap-2 tabular-nums",
                    v.version === currentVersion && "font-semibold text-accent"
                  )}
                  href={buildSkillVersionHref(slug, v.version)}
                >
                  v{v.version}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
