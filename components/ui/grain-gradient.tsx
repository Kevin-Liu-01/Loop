import { cn } from "@/lib/cn";

/* ── Tint presets (CSS classes handle light/dark in globals.css) ── */

export type GrainTint = "accent" | "warm" | "neutral" | "none";

const TINT_CLASS: Record<GrainTint, string | undefined> = {
  accent: "grain-tint-accent",
  neutral: "grain-tint-neutral",
  none: undefined,
  warm: "grain-tint-warm",
};

/* ── Noise intensity ──────────────────────────────────────────────── */

export type GrainIntensity = "subtle" | "medium" | "strong";

const INTENSITY_CLASS: Record<GrainIntensity, string> = {
  medium: "grain-medium",
  strong: "grain-strong",
  subtle: "grain-subtle",
};

/* ── Component ────────────────────────────────────────────────────── */

export interface GrainGradientProps {
  tint?: GrainTint;
  intensity?: GrainIntensity;
  className?: string;
}

/**
 * Absolutely-positioned grain + tinted gradient overlay.
 *
 * Drop inside any `relative overflow-hidden` container and keep
 * content at `z-10` so it stays above the effect layer.
 *
 * @example
 * <div className="relative overflow-hidden">
 *   <GrainGradient tint="accent" intensity="medium" />
 *   <div className="relative z-10">…content…</div>
 * </div>
 */
export function GrainGradient({
  tint = "accent",
  intensity = "medium",
  className,
}: GrainGradientProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        TINT_CLASS[tint],
        INTENSITY_CLASS[intensity],
        className
      )}
    />
  );
}
