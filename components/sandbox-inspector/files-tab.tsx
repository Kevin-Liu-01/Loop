"use client";

import {
  ChevronLeftIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@/components/frontier-icons";
import { cn } from "@/lib/cn";
import type { FileEntry } from "@/lib/sandbox-inspect-types";

interface FilesTabProps {
  files: FileEntry[];
  currentPath: string;
  isLoading: boolean;
  onBrowse: (path: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parentPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) {
    return "/";
  }
  return "/" + parts.slice(0, -1).join("/");
}

function FileRow({
  entry,
  onBrowse,
}: {
  entry: FileEntry;
  onBrowse: (path: string) => void;
}) {
  const Icon = entry.isDir ? FolderIcon : FileIcon;

  return (
    <button
      className={cn(
        "flex w-full items-center gap-2.5 border-b border-line/60 px-3 py-2 text-left text-[0.8125rem] transition-colors last:border-b-0",
        entry.isDir ? "cursor-pointer hover:bg-paper-2/50" : "cursor-default"
      )}
      onClick={() => entry.isDir && onBrowse(entry.path)}
      type="button"
      disabled={!entry.isDir}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          entry.isDir ? "text-accent" : "text-ink-faint/50"
        )}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          entry.isDir ? "font-medium text-ink" : "text-ink-soft"
        )}
      >
        {entry.name}
      </span>
      {!entry.isDir && (
        <span className="shrink-0 font-mono text-[0.5625rem] tabular-nums text-ink-faint/50">
          {formatSize(entry.size)}
        </span>
      )}
    </button>
  );
}

export function FilesTab({
  files,
  currentPath,
  isLoading,
  onBrowse,
}: FilesTabProps) {
  const showBack = currentPath !== "/";

  if (isLoading && files.length === 0) {
    return (
      <div className="grid gap-0 p-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-7 animate-pulse border-b border-line/60 bg-paper-2/30"
          />
        ))}
      </div>
    );
  }

  const sortedFiles = [...files].toSorted((a, b) => {
    if (a.isDir !== b.isDir) {
      return a.isDir ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="grid gap-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 border-b border-line bg-paper-2/30 px-3 py-2">
        {showBack && (
          <button
            className="flex h-5 w-5 items-center justify-center transition-colors hover:bg-paper-3/60"
            onClick={() => onBrowse(parentPath(currentPath))}
            type="button"
            aria-label="Go up"
          >
            <ChevronLeftIcon className="h-3 w-3 text-ink-faint" />
          </button>
        )}
        <FolderOpenIcon className="h-3 w-3 shrink-0 text-accent" />
        <span className="min-w-0 truncate font-mono text-[0.6875rem] text-ink-faint">
          {currentPath}
        </span>
      </div>

      {/* File list */}
      {sortedFiles.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 px-3 py-8 text-center">
          <FolderOpenIcon className="h-5 w-5 text-ink-faint/30" />
          <p className="text-xs font-medium text-ink-faint/60">
            Empty directory
          </p>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto overscroll-contain">
          {sortedFiles.map((entry) => (
            <FileRow key={entry.path} entry={entry} onBrowse={onBrowse} />
          ))}
        </div>
      )}
    </div>
  );
}
