import type { SVGProps } from "react";

type LoopLogoProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

/**
 * Golden-ratio loop mark.
 *
 * A bold ring-arc (275° sweep, gap ≈ 360°/φ³) with a center accent dot.
 * R_outer / R_inner = φ (stroke 19 on R 40 → 49.5 / 30.5 ≈ 1.62).
 * Dot radius = stroke / φ² ≈ 7.
 */
export function LoopLogo({ title = "Loop", ...props }: LoopLogoProps) {
  return (
    <svg fill="none" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>{title}</title>
      <path
        d="M101 75A40 40 0 1 1 82 25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="19"
      />
      <circle cx="64" cy="60" fill="currentColor" r="7" />
    </svg>
  );
}
