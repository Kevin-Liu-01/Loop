"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { BrailleSpinner } from "@/components/ui/braille-spinner";
import type { SpinnerName } from "@/components/ui/braille-spinner";
import { cn } from "@/lib/cn";

interface LoadingStatusPillProps {
  label: string;
  spinner?: SpinnerName;
  className?: string;
}

/** Viewport-centered status pill used across route-level loading states.
 *  Rendered via a portal to `document.body` so `position: fixed` resolves
 *  against the real viewport instead of whatever ancestor happens to have
 *  a `backdrop-filter` / `transform` / `filter` (each of which silently
 *  creates a containing block for fixed descendants and pulls the pill
 *  off-center). */
export function LoadingStatusPill({
  label,
  spinner = "braille",
  className,
}: LoadingStatusPillProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed left-1/2 top-1/2 z-40 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 border border-line bg-paper/95 px-3 py-1.5 text-xs font-mono text-ink-muted shadow-[0_1px_2px_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.18)] backdrop-blur-md dark:bg-paper/90",
        className
      )}
      role="status"
    >
      <BrailleSpinner className="text-sm text-ink-soft" name={spinner} />
      <span className="tracking-tight">{label}</span>
    </div>,
    document.body
  );
}
