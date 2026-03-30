/**
 * Hero GLB served from /public. Khronos glTF sample (DamagedHelmet).
 */
export const HERO_MODEL_PATH = "/models/DamagedHelmet.glb";

/**
 * Initial camera before `<Bounds fit>` runs; replaced by auto-fit framing.
 */
export const HERO_CAMERA = {
  position: [0, 0.2, 5.5] as const,
  fov: 45,
};

/** Extra padding so the helmet never clips when it rotates or floats. */
export const HERO_BOUNDS_MARGIN = 1.72;

/**
 * Overlay config for the skill-text renderer.
 * `resolution` controls the grid density (fraction of viewport → one cell).
 */
export const HERO_OVERLAY = {
  resolution: 0.12,
  bgColor: "#08080a",
} as const;

export const HERO_SPOT_COLOR = "#e8650a";
