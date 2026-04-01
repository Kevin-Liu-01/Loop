"use client";

import { cn } from "@/lib/cn";

type OpenRunLogButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export function OpenRunLogButton({ className, children }: OpenRunLogButtonProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-center gap-2 border border-line bg-paper-3 px-3 py-2.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent/40 hover:bg-paper-2/60 hover:text-ink",
        className
      )}
      onClick={() => window.dispatchEvent(new CustomEvent("open-run-log"))}
      type="button"
    >
      {children}
    </button>
  );
}
