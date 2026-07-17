import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { AccessibleDialog } from "../components/AccessibleDialog";
import { BlurText } from "../components/BlurText";
import { Polaroid } from "../components/Polaroid";
import { useScrubVideo } from "../hooks/useScrubVideo";
import { MEDIA, POSTERS } from "../lib/media";
import { remap } from "../lib/timeline";

const RIBS_FREEZE_T = 10.3;
const EXPO = [0.16, 1, 0.3, 1] as const;

interface S4Props {
  localP: number;
}

type Slot = {
  x: number;
  y: number;
  rot: number;
  widthVw?: number;
  layer?: number;
  src: string;
  wide?: boolean;
  title: string;
  archive: string;
  year: string;
  alt: string;
};

const RIBS: Slot = {
  x: -2,
  y: 0,
  rot: -2,
  widthVw: 19,
  layer: 24,
  src: "/media/desk/ribs-freeze.jpg",
  wide: true,
  title: "Stage in Blue",
  archive: "moving image",
  year: "2025",
  alt: "A blue-lit stage seen through a rib-like opening.",
};

const SLOTS: Slot[] = [
  {
    x: -36, y: -11, rot: -8, widthVw: 10.8, layer: 15, src: "/media/polaroids/window-portrait.webp",
    title: "Cloudline", archive: "new memory", year: "2024",
    alt: "A young man sits in profile beside a glowing high-rise window.",
  },
  {
    x: -34, y: 12, rot: 5, widthVw: 10.3, layer: 18, src: "/media/polaroids/dog-embrace.webp",
    title: "Old friend", archive: "new memory", year: "2024",
    alt: "A young man embraces a large white dog outdoors at dusk.",
  },
  {
    x: -20, y: 16, rot: -4, widthVw: 15.5, layer: 17, src: "/media/polaroids/rooftop-night.webp", wide: true,
    title: "Above the snow", archive: "new memory", year: "2025",
    alt: "A silhouetted person stands on a rooftop above a snowy campus at night.",
  },
  {
    x: 20, y: -13, rot: 5, widthVw: 17.5, layer: 16, src: "/media/polaroids/sphere-night.webp", wide: true,
    title: "A sphere of light", archive: "new memory", year: "2025",
    alt: "A person photographs the brightly illuminated Sphere in Las Vegas at night.",
  },
  {
    x: 34, y: -2, rot: -4, widthVw: 15.2, layer: 19, src: "/media/polaroids/basketball-court.webp", wide: true,
    title: "At the line", archive: "new memory", year: "year unknown",
    alt: "Basketball players prepare for a free throw in a crowded gym.",
  },
  {
    x: 32, y: 14, rot: 6, widthVw: 14.5, layer: 22, src: "/media/polaroids/rescued-cat.webp", wide: true,
    title: "Found in sunlight", archive: "new memory", year: "2023",
    alt: "A tabby cat is held gently in warm sunlight.",
  },
  {
    x: 4, y: -17, rot: 2, widthVw: 9.8, layer: 14, src: "/media/polaroids/raccoon-visitor.webp",
    title: "Night visitor", archive: "new memory", year: "2025",
    alt: "A raccoon looks up toward the camera beside a patch of grass at night.",
  },
  {
    x: 1, y: 16, rot: -5, widthVw: 16.5, layer: 20, src: "/media/polaroids/campus-evening.webp", wide: true,
    title: "Walking into evening", archive: "new memory", year: "2025",
    alt: "A person walks across a lawn toward Toronto's illuminated skyline at dusk.",
  },
  {
    x: 17, y: 17, rot: 4, widthVw: 9.8, layer: 23, src: "/media/polaroids/studio-room.webp",
    title: "The room I made", archive: "new memory", year: "2026",
    alt: "A warmly lit studio room holds artwork, a bicycle, books, and a low table.",
  },
  {
    x: -20, y: -15, rot: -5, widthVw: 14.2, layer: 13, src: "/media/polaroids/sparkler-night.webp", wide: true,
    title: "First sparkler", archive: "new memory", year: "2024",
    alt: "A child in a red winter coat watches a bright sparkler flare at night.",
  },
];

const ALL = [RIBS, ...SLOTS];

export function S4BlueMemoirs({ localP }: S4Props) {
  const ribsRef = useRef<HTMLVideoElement>(null);
  const [focused, setFocused] = useState<number | null>(null);

  const freezeEnd = 0.22;
  const birthEnd = 0.42;
  useScrubVideo(ribsRef, localP < freezeEnd ? remap(localP, 0, freezeEnd) * RIBS_FREEZE_T : RIBS_FREEZE_T);

  const ribsOpacity = remap(localP, 0, 0.04);
  const birthT = remap(localP, freezeEnd, birthEnd);
  const deskT = remap(localP, 0.26, 0.5);
  const othersT = remap(localP, 0.46, 0.68);
  const posterT = remap(localP, 0.68, 0.86);
  const textT = remap(localP, 0.72, 0.86);
  // Preserve a deliberate reading hold from 0.86–0.95 before the blackout.
  // This gives wheel input somewhere to land without immediately overshooting.
  const runwayT = remap(localP, 0.95, 1);
  const sceneFade = 1 - runwayT;

  const bx = 50 + RIBS.x * birthT;
  const by = 50 + RIBS.y * birthT;
  // Land on the same proportions as the persistent wide Polaroid so the
  // transition can hand off without a visible size or frame jump.
  const bw = 100 - birthT * (100 - (RIBS.widthVw ?? 17));
  const pad = 4.5 * birthT;
  const padB = 12 * birthT;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden" style={{ perspective: "1400px" }}>
      <video
        ref={ribsRef}
        src={MEDIA.ribs}
        poster={POSTERS.ribs}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: localP >= freezeEnd ? 0 : ribsOpacity }}
      />

      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          opacity: Math.min(deskT, sceneFade),
          transform: `scale(${0.9 + deskT * 0.1}) translateY(${(1 - deskT) * 4}vh) rotateX(${8 - deskT * 6}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <img src="/media/desk/table.png" alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(78% 74% at 50% 40%, rgba(0,0,0,0) 46%, rgba(0,0,0,0.7) 100%)" }} />
        <motion.div
          className="absolute rounded-full"
          style={{ left: "40%", top: "18%", width: "42vw", height: "42vw", background: "radial-gradient(circle, rgba(255,196,120,0.16) 0%, rgba(255,196,120,0) 70%)", filter: "blur(34px)", mixBlendMode: "screen" }}
          animate={{ x: ["-4%", "5%", "-4%"], y: ["-3%", "4%", "-3%"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {localP >= freezeEnd && birthT < 1 && (
        <div className="absolute" aria-hidden="true" style={{ left: `${bx}%`, top: `${by}%`, width: `${bw}vw`, transform: `translate(-50%,-50%) rotate(${RIBS.rot * birthT}deg)`, opacity: sceneFade, zIndex: 25 }}>
          <div className="bg-[#f6f2e9]" style={{ padding: `${pad}% ${pad}% ${padB}% ${pad}%`, borderRadius: "3px", boxShadow: `0 ${birthT * 14}px ${birthT * 34}px rgba(0,0,0,${birthT * 0.5})` }}>
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
              <img src={RIBS.src} alt="" className="w-full h-full object-cover" draggable={false} />
            </div>
          </div>
        </div>
      )}

      {localP >= birthEnd - 0.02 && (
        <div
          className="absolute inset-0"
          aria-hidden={runwayT > 0.05}
          inert={runwayT > 0.05}
          style={{ opacity: sceneFade }}
        >
          {ALL.map((slot, index) => {
            const memoryIndex = index - 1;
            const appear = index === 0
              ? (birthT >= 1 ? 1 : 0)
              : memoryIndex === 0
                ? 1
                : remap(othersT, 0.05 + memoryIndex * 0.07, 0.3 + memoryIndex * 0.07);
            return (
              <button
                key={slot.src}
                type="button"
                aria-label={`View ${slot.title}, ${slot.archive}, ${slot.year}`}
                aria-hidden={appear <= 0.72}
                tabIndex={appear > 0.72 ? 0 : -1}
                className="memory-photo absolute border-0 bg-transparent p-0"
                onClick={() => setFocused(index)}
                style={{
                  left: `${50 + slot.x}%`,
                  top: `${50 + slot.y - posterT * 46}%`,
                  width: `${slot.widthVw ?? (slot.wide ? 17 : 10.5)}vw`,
                  transform: `translate(-50%,-50%) rotate(${slot.rot}deg) scale(${appear})`,
                  opacity: appear,
                  zIndex: slot.layer ?? 10 + index,
                }}
              >
                <motion.span
                  className="block"
                  style={{ filter: "drop-shadow(0 0 16px rgba(255,180,90,0.1))" }}
                  whileHover={{ scale: 1.06, filter: "drop-shadow(0 0 26px rgba(255,196,120,0.45))" }}
                  transition={{ type: "tween", ease: EXPO, duration: 0.4 }}
                >
                  <Polaroid src={slot.src} wide={slot.wide} />
                </motion.span>
              </button>
            );
          })}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-[24%] flex justify-center px-8" style={{ opacity: posterT * sceneFade, pointerEvents: "none" }}>
        <div className="relative inline-block px-16 py-8">
          <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(130% 135% at 50% 50%, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.74) 48%, rgba(0,0,0,0) 100%)" }} />
          <BlurText
            text="As far back as I can remember, these fragments have made up my life."
            progress={textT}
            className="font-heading italic font-light text-white text-[2.15rem] leading-snug text-center max-w-[26ch] tracking-[0.015em] text-scrim"
          />
        </div>
      </div>

      {focused !== null ? (
        <AccessibleDialog
          title={`${ALL[focused].title} photograph`}
          onClose={() => setFocused(null)}
          className="accessible-dialog--warm"
          panelClassName="memory-dialog"
        >
          <motion.div
            className="memory-dialog__photo"
            style={{ width: ALL[focused].wide ? "min(56vw, 960px)" : "min(30vw, 440px)" }}
            initial={{ scale: 0.78, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EXPO }}
          >
            <Polaroid src={ALL[focused].src} alt={ALL[focused].alt} wide={ALL[focused].wide} />
          </motion.div>
        </AccessibleDialog>
      ) : null}

      <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: runwayT }} />
    </div>
  );
}
