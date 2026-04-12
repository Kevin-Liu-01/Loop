"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import {
  computeDiffStats,
  computeInlineSegments,
  groupIntoHunks,
  pairChangedLines,
} from "@/lib/diff-utils";
import type { DiffHunk, InlineSegment } from "@/lib/diff-utils";
import type { DiffLine } from "@/lib/types";

interface DiffViewerProps {
  lines: DiffLine[];
  compact?: boolean;
  maxHeight?: number;
  label?: string;
  truncatedTotal?: number;
}

export function DiffViewer({
  lines,
  compact = false,
  maxHeight = 480,
  label,
  truncatedTotal,
}: DiffViewerProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => computeDiffStats(lines), [lines]);
  const hunks = useMemo(() => groupIntoHunks(lines), [lines]);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className={cn("diff-viewer", compact && "diff-viewer--compact")}>
      <header className="diff-viewer__header">
        <div className="flex items-center gap-2.5">
          {label ? (
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
              {label}
            </span>
          ) : null}
          <div className="flex items-center gap-1.5">
            {stats.added > 0 ? (
              <span className="diff-viewer__stat diff-viewer__stat--added">
                +{stats.added}
              </span>
            ) : null}
            {stats.removed > 0 ? (
              <span className="diff-viewer__stat diff-viewer__stat--removed">
                &minus;{stats.removed}
              </span>
            ) : null}
          </div>
        </div>
        {!compact && lines.length > 20 ? (
          <button
            className="text-[0.65rem] font-medium text-ink-soft transition-colors hover:text-ink"
            onClick={() => setExpanded((prev) => !prev)}
            type="button"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        ) : null}
      </header>

      <div
        className="diff-viewer__body"
        style={{ maxHeight: expanded ? "none" : maxHeight }}
      >
        {hunks.map((hunk, hunkIdx) => (
          <HunkBlock
            compact={compact}
            hunk={hunk}
            isFirst={hunkIdx === 0}
            key={`${hunk.startLeft}-${hunk.startRight}`}
          />
        ))}
      </div>

      {truncatedTotal && truncatedTotal > lines.length ? (
        <footer className="diff-viewer__footer">
          Showing {lines.length} of {truncatedTotal} lines
        </footer>
      ) : null}
    </div>
  );
}

function HunkBlock({
  hunk,
  isFirst,
  compact,
}: {
  hunk: DiffHunk;
  isFirst: boolean;
  compact: boolean;
}) {
  const pairedLines = useMemo(() => pairChangedLines(hunk.lines), [hunk.lines]);

  const inlineCache = useMemo(() => {
    const cache = new Map<
      number,
      { oldSegments: InlineSegment[]; newSegments: InlineSegment[] }
    >();
    for (const [removedIdx, addedIdx] of pairedLines.entries()) {
      const oldText = hunk.lines[removedIdx].value;
      const newText = hunk.lines[addedIdx].value;
      if (oldText && newText) {
        cache.set(removedIdx, computeInlineSegments(oldText, newText));
      }
    }
    return cache;
  }, [hunk.lines, pairedLines]);

  return (
    <div className="diff-viewer__hunk">
      {!isFirst ? (
        <div className="diff-viewer__hunk-sep">
          <span className="diff-viewer__hunk-sep-line" />
          <span className="diff-viewer__hunk-sep-label">
            @@ &minus;{hunk.startLeft} +{hunk.startRight} @@
          </span>
          <span className="diff-viewer__hunk-sep-line" />
        </div>
      ) : null}

      {hunk.lines.map((line, lineIdx) => {
        const isRemoved = line.type === "removed";
        const isAdded = line.type === "added";
        const pairedAddedIdx = pairedLines.get(lineIdx);
        const inlineData =
          isRemoved && pairedAddedIdx !== undefined
            ? inlineCache.get(lineIdx)
            : isAdded
              ? findInlineCacheForAdded(lineIdx, pairedLines, inlineCache)
              : undefined;

        return (
          <div
            className={cn(
              "diff-viewer__line",
              isAdded && "diff-viewer__line--added",
              isRemoved && "diff-viewer__line--removed"
            )}
            key={`${line.type}-${lineIdx}`}
          >
            {!compact ? (
              <>
                <span className="diff-viewer__gutter diff-viewer__gutter--left">
                  {line.leftNumber ?? ""}
                </span>
                <span className="diff-viewer__gutter diff-viewer__gutter--right">
                  {line.rightNumber ?? ""}
                </span>
              </>
            ) : null}
            <span
              className={cn(
                "diff-viewer__marker",
                isAdded && "diff-viewer__marker--added",
                isRemoved && "diff-viewer__marker--removed"
              )}
            >
              {isAdded ? "+" : isRemoved ? "\u2212" : " "}
            </span>
            <code className="diff-viewer__content">
              {inlineData ? (
                <InlineHighlight
                  segments={
                    isRemoved ? inlineData.oldSegments : inlineData.newSegments
                  }
                  type={line.type}
                />
              ) : (
                <span>{line.value || " "}</span>
              )}
            </code>
          </div>
        );
      })}
    </div>
  );
}

function findInlineCacheForAdded(
  addedIdx: number,
  pairs: Map<number, number>,
  cache: Map<
    number,
    { oldSegments: InlineSegment[]; newSegments: InlineSegment[] }
  >
): { oldSegments: InlineSegment[]; newSegments: InlineSegment[] } | undefined {
  for (const [removedIdx, pairedAdded] of pairs.entries()) {
    if (pairedAdded === addedIdx) {
      return cache.get(removedIdx);
    }
  }
  return undefined;
}

function InlineHighlight({
  segments,
  type,
}: {
  segments: InlineSegment[];
  type: DiffLine["type"];
}) {
  return (
    <>
      {segments.map((seg, i) => (
        <span
          className={cn(
            seg.highlight && type === "added" && "diff-viewer__word--added",
            seg.highlight && type === "removed" && "diff-viewer__word--removed"
          )}
          key={i}
        >
          {seg.text}
        </span>
      ))}
    </>
  );
}
