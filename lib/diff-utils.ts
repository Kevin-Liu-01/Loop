import type { DiffLine } from "@/lib/types";

export type DiffStats = {
  added: number;
  removed: number;
};

export type InlineSegment = {
  text: string;
  highlight: boolean;
};

export type DiffHunk = {
  startLeft: number;
  startRight: number;
  lines: DiffLine[];
};

const CONTEXT_RADIUS = 3;

export function computeDiffStats(lines: DiffLine[]): DiffStats {
  let added = 0;
  let removed = 0;
  for (const line of lines) {
    if (line.type === "added") added += 1;
    if (line.type === "removed") removed += 1;
  }
  return { added, removed };
}

export function groupIntoHunks(lines: DiffLine[]): DiffHunk[] {
  if (lines.length === 0) return [];

  const changeIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].type !== "context") changeIndices.push(i);
  }

  if (changeIndices.length === 0) return [];

  const included = new Set<number>();
  for (const ci of changeIndices) {
    const lo = Math.max(0, ci - CONTEXT_RADIUS);
    const hi = Math.min(lines.length - 1, ci + CONTEXT_RADIUS);
    for (let i = lo; i <= hi; i++) included.add(i);
  }

  const sorted = Array.from(included).sort((a, b) => a - b);
  const hunks: DiffHunk[] = [];
  let current: number[] = [];

  for (const idx of sorted) {
    if (current.length > 0 && idx > current[current.length - 1] + 1) {
      hunks.push(buildHunk(lines, current));
      current = [];
    }
    current.push(idx);
  }
  if (current.length > 0) hunks.push(buildHunk(lines, current));

  return hunks;
}

function buildHunk(allLines: DiffLine[], indices: number[]): DiffHunk {
  const hunkLines = indices.map((i) => allLines[i]);
  const first = hunkLines[0];
  return {
    startLeft: first.leftNumber ?? first.rightNumber ?? 1,
    startRight: first.rightNumber ?? first.leftNumber ?? 1,
    lines: hunkLines,
  };
}

/**
 * Given a removed line and an added line that form a pair, compute
 * inline segments highlighting the word-level differences.
 */
export function computeInlineSegments(
  oldText: string,
  newText: string
): { oldSegments: InlineSegment[]; newSegments: InlineSegment[] } {
  const oldWords = tokenize(oldText);
  const newWords = tokenize(newText);
  const lcs = wordLCS(oldWords, newWords);

  return {
    oldSegments: buildSegments(oldWords, lcs, "old"),
    newSegments: buildSegments(newWords, lcs, "new"),
  };
}

function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? [];
}

function wordLCS(a: string[], b: string[]): _LCSResult {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const matchedA = new Set<number>();
  const matchedB = new Set<number>();
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      matchedA.add(i - 1);
      matchedB.add(j - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return new _LCSResult(matchedA, matchedB);
}

class _LCSResult {
  constructor(
    readonly matchedA: Set<number>,
    readonly matchedB: Set<number>
  ) {}
}

function buildSegments(
  tokens: string[],
  result: _LCSResult,
  side: "old" | "new"
): InlineSegment[] {
  const matched = side === "old" ? result.matchedA : result.matchedB;
  const segments: InlineSegment[] = [];
  let buf = "";
  let bufHighlight = false;

  for (let i = 0; i < tokens.length; i++) {
    const isMatch = matched.has(i);
    const highlight = !isMatch;

    if (i === 0) {
      bufHighlight = highlight;
    }

    if (highlight !== bufHighlight) {
      if (buf) segments.push({ text: buf, highlight: bufHighlight });
      buf = "";
      bufHighlight = highlight;
    }
    buf += tokens[i];
  }

  if (buf) segments.push({ text: buf, highlight: bufHighlight });
  return segments;
}

/**
 * Pair up consecutive removed+added lines so we can compute inline diffs.
 * Returns an array of pairs: [removedIndex, addedIndex] within the hunk.
 */
export function pairChangedLines(lines: DiffLine[]): Map<number, number> {
  const pairs = new Map<number, number>();
  let i = 0;

  while (i < lines.length) {
    if (lines[i].type === "removed") {
      const removeStart = i;
      const removed: number[] = [];
      while (i < lines.length && lines[i].type === "removed") {
        removed.push(i);
        i++;
      }
      const added: number[] = [];
      while (i < lines.length && lines[i].type === "added") {
        added.push(i);
        i++;
      }
      const pairCount = Math.min(removed.length, added.length);
      for (let p = 0; p < pairCount; p++) {
        pairs.set(removed[p], added[p]);
      }
    } else {
      i++;
    }
  }

  return pairs;
}
