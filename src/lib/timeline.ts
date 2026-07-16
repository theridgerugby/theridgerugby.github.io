// Scene layout of the master scroll timeline.
// Each scene gets a length in "viewport units" (vh multiples) determining
// how much scroll distance it consumes relative to the others.
export const SCENE_LENGTHS = {
  s0: 3.2, // Overture — portrait/eyes/run/vault
  s1: 2.2, // The Question — WeChat beat
  s2: 1.6, // Arrival — pearson scroll-scrub
  s3: 1.6, // Life Here — family-archive projector reel
  s4: 4.0, // Blue Memoirs — ribs → memory desk → memoir poster → reading hold
  s5: 2.4, // Photography — 3D carousel browse, rig slides right out
  s6: 2.8, // Research — manifesto intertitle + two glass vitrines
  s7: 1.4, // Curtain — A3 hero run + signature
  s5Prelude: 1.5, // Camera intertitle before the photography gallery
} as const;

export type SceneKey = keyof typeof SCENE_LENGTHS;

export const SCENE_ORDER: SceneKey[] = ["s0", "s1", "s2", "s3", "s4", "s5Prelude", "s5", "s6", "s7"];

const TOTAL_LENGTH = SCENE_ORDER.reduce((sum, key) => sum + SCENE_LENGTHS[key], 0);

export interface SceneRange {
  key: SceneKey;
  start: number; // 0..1 global progress
  end: number; // 0..1 global progress
}

export const SCENE_RANGES: SceneRange[] = (() => {
  let acc = 0;
  return SCENE_ORDER.map((key) => {
    const start = acc / TOTAL_LENGTH;
    acc += SCENE_LENGTHS[key];
    const end = acc / TOTAL_LENGTH;
    return { key, start, end };
  });
})();

export const TOTAL_VH = TOTAL_LENGTH;

/** Given global progress p (0..1), return local progress (0..1, clamped) for a scene. */
export function localProgress(p: number, key: SceneKey): number {
  const range = SCENE_RANGES.find((r) => r.key === key)!;
  if (p <= range.start) return 0;
  if (p >= range.end) return 1;
  return (p - range.start) / (range.end - range.start);
}

/** Returns true if global progress p is within (or near) the scene's range. */
export function isSceneActive(p: number, key: SceneKey, pad = 0): boolean {
  const range = SCENE_RANGES.find((r) => r.key === key)!;
  return p >= range.start - pad && p <= range.end + pad;
}

/** Remap a sub-range [a,b] of local progress to 0..1, clamped. */
export function remap(t: number, a: number, b: number): number {
  if (a === b) return t < a ? 0 : 1;
  const v = (t - a) / (b - a);
  return Math.min(1, Math.max(0, v));
}
