import type { SVGProps } from "react";

type LoopLogoProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

/**
 * Golden-ratio gear-loop mark.
 *
 * 275° ring-arc with 6 gear teeth on the outer edge. Gap ≈ 360°/φ³.
 * Tip R 52 / Base R 42 / Bore R 28 — base/bore ≈ φ (1.5).
 * Center dot (r 7) = axle. Filled path, no stroke.
 */
export function LoopLogo({ title = "Loop", ...props }: LoopLogoProps) {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>{title}</title>
      <path
        d="M103 76A42 42 0 0 1 98 84L107 90A52 52 0 0 1 94 103L88 94A42 42 0 0 1 71 102L72 111A52 52 0 0 1 54 111L56 101A42 42 0 0 1 39 94L33 102A52 52 0 0 1 20 88L29 83A42 42 0 0 1 22 65L12 66A52 52 0 0 1 13 48L23 51A42 42 0 0 1 31 34L24 27A52 52 0 0 1 37 15L42 24A42 42 0 0 1 60 18L60 8A52 52 0 0 1 78 10L75 19A42 42 0 0 1 83 23A7 7 0 0 1 77 35A28 28 0 1 0 90 71A7 7 0 0 1 103 76Z"
        fill="currentColor"
      />
      <circle cx="64" cy="60" fill="currentColor" r="7" />
    </svg>
  );
}
