/**
 * Shared modal / dialog presentation tokens for Radix Dialog wrappers.
 * Keeps overlay, surface depth, and header rhythm aligned with app aesthetic.
 */

/** Extra classes applied to DialogContent for editorial “floating panel” depth. */
export const modalDialogContentSurface =
  "border border-line/80 bg-paper-3 shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_40px_-8px_rgba(0,0,0,0.12),0_4px_12px_-4px_rgba(0,0,0,0.06)] ring-1 ring-ink/[0.04] dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_16px_48px_-8px_rgba(0,0,0,0.55),0_4px_16px_-4px_rgba(0,0,0,0.35)] dark:ring-white/[0.06]";

/** Backdrop: soft vignette + light blur (motion rules: keep blur minimal). */
export const modalDialogOverlay =
  "bg-ink/[0.28] backdrop-blur-[2px] dark:bg-black/55";
