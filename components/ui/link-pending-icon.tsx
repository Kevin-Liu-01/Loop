"use client";

import { useLinkStatus } from "next/link";

import { BrailleSpinner } from "@/components/ui/braille-spinner";
import type { SpinnerName } from "@/components/ui/braille-spinner";
import { cn } from "@/lib/cn";

interface LinkPendingIconProps {
  /** The default icon/content to render when navigation is idle. */
  children: React.ReactNode;
  /** Tailwind classes applied to both idle and pending states so the swap
   *  keeps the same footprint. */
  className?: string;
  spinner?: SpinnerName;
}

/** Swaps its children for a braille spinner while the nearest ancestor `<Link>`
 *  is pending. Must be rendered inside a `next/link` tree — typical usage is
 *  inside a `<LinkButton>` so the navbar icon flips to a spinner the instant
 *  a user clicks, before the target route's skeleton paints. */
export function LinkPendingIcon({
  children,
  className,
  spinner = "braille",
}: LinkPendingIconProps) {
  const { pending } = useLinkStatus();

  if (pending) {
    return (
      <BrailleSpinner
        className={cn("text-[0.9em] leading-none", className)}
        name={spinner}
      />
    );
  }

  return (
    <span className={cn("inline-flex leading-none", className)}>
      {children}
    </span>
  );
}
