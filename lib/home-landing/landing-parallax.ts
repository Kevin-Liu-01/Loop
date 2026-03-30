/**
 * Maps scroll progress in [0, 1] to a pixel offset for layered parallax.
 * `depth` in roughly [-1, 1]: negative = farther/slower, positive = closer/faster.
 */
export function parallaxOffsetPx(
  progress: number,
  depth: number,
  maxTravelPx: number
): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return clamped * maxTravelPx * depth;
}
