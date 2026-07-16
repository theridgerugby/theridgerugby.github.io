import { SCENE_RANGES, remap } from "../lib/timeline";

/**
 * StageFrame — the theatre's proscenium (DESIGN.md §2).
 * A persistent, subtle letterbox frames every act; the bottom band doubles as
 * the STAGE APRON — the dark floor strip the stag lives on, guaranteeing its
 * legibility over bright footage. During S2 (Pearson, documentary daylight)
 * the bars deepen into full cinema letterboxing (user: 电影感强的).
 * Sits above scenes (z-30), below the stag (z-40) and grain (z-500).
 */
export function StageFrame({ progress }: { progress: number }) {
  const s2 = SCENE_RANGES.find((r) => r.key === "s2")!;
  const inS2 =
    remap(progress, s2.start - 0.008, s2.start + 0.02) *
    (1 - remap(progress, s2.end - 0.02, s2.end + 0.008));

  const bar = 3.5 + inS2 * 7; // vh — 3.5 base, ~10.5 during Pearson

  return (
    <div className="fixed inset-0 z-30 pointer-events-none" aria-hidden="true">
      {/* top of the proscenium */}
      <div
        className="absolute top-0 inset-x-0"
        style={{
          height: `${bar}vh`,
          background: `linear-gradient(180deg, #000 ${40 + inS2 * 45}%, transparent 100%)`,
        }}
      />
      {/* bottom bar + stage apron (the stag's floor) */}
      <div
        className="absolute bottom-0 inset-x-0"
        style={{
          height: `${bar + 7}vh`,
          background: `linear-gradient(0deg, #000 ${22 + inS2 * 30}%, rgba(0,0,0,0.5) 58%, transparent 100%)`,
        }}
      />
    </div>
  );
}
