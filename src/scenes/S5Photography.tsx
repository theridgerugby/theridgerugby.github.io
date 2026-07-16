import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AccessibleDialog } from "../components/AccessibleDialog";
import { GlassSurface } from "../components/Glass";
import { remap } from "../lib/timeline";

const EXPO = [0.16, 1, 0.3, 1] as const;

interface S5Props {
  localP: number; // 0..1 within S5
}

type Work = {
  title: string | null;
  location: string;
  taken: string;
  slug: string;
  aspectRatio: number;
  alt: string;
  objectPosition?: string;
};

const WORKS: Work[] = [
  {
    title: "Where to go?",
    location: "University of Toronto",
    taken: "August 26, 2025",
    slug: "no-exit",
    aspectRatio: 1.5,
    alt: "A person stands beside a bicycle at night near a yellow No Exit sign.",
  },
  {
    title: "Path",
    location: "Seattle",
    taken: "April 21, 2025",
    slug: "passage",
    aspectRatio: 3863 / 5150,
    alt: "Silhouetted visitors walk through a dark covered passage toward daylight.",
  },
  {
    title: "countdown",
    location: "Toronto",
    taken: "January 16, 2024",
    slug: "christmas-eve",
    aspectRatio: 4392 / 3118,
    alt: "A person faces a glowing Christmas market beneath a sign counting down one day.",
  },
  {
    title: "ripped",
    location: "China",
    taken: "May 29, 2026",
    slug: "roofless",
    aspectRatio: 4 / 3,
    alt: "A person stands inside a vast roofless industrial building.",
  },
  {
    title: null,
    location: "Arizona",
    taken: "March 13, 2025",
    slug: "under-the-arch",
    aspectRatio: 3 / 4,
    alt: "A person jumps beneath a red sandstone arch.",
    objectPosition: "center bottom",
  },
  {
    title: null,
    location: "Oakville",
    taken: "September 11, 2024",
    slug: "afterglow",
    aspectRatio: 4 / 3,
    alt: "People gather along a rocky shoreline beneath a pink sunset.",
  },
  {
    title: "let there be light",
    location: "Los Angeles",
    taken: "July 14, 2024",
    slug: "city-at-night",
    aspectRatio: 3962 / 1783,
    alt: "A wide nighttime cityscape glows beneath a dark sky.",
  },
];

const workName = (work: Work) => work.title ?? `Photograph from ${work.location}`;

const workDialogTitle = (work: Work) =>
  work.title ? `${work.title} photograph` : `Photograph from ${work.location}`;

const workDescription = (work: Work) =>
  [work.title, work.location, work.taken].filter(Boolean).join(", ");

const workSrc = (work: Work, width: 640 | 1280 | 1920) =>
  `/media/gallery/${work.slug}-${width}.webp`;

const workSrcSet = (work: Work) =>
  ([640, 1280, 1920] as const).map((width) => `${workSrc(work, width)} ${width}w`).join(", ");

function ResponsiveWorkImage({
  work,
  alt,
  sizes,
  className,
  loading = "lazy",
}: {
  work: Work;
  alt: string;
  sizes: string;
  className: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <img
      src={workSrc(work, 1280)}
      srcSet={workSrcSet(work)}
      sizes={sizes}
      alt={alt}
      draggable={false}
      decoding="async"
      loading={loading}
      className={className}
      style={{ objectPosition: work.objectPosition ?? "center" }}
    />
  );
}

function FramedWorkImage({ work, alt, sizes }: { work: Work; alt: string; sizes: string }) {
  return (
    <ResponsiveWorkImage
      work={work}
      alt={alt}
      sizes={sizes}
      className="absolute inset-0 h-full w-full object-cover"
      loading="eager"
    />
  );
}

const dialogWidth = (aspectRatio: number) => {
  if (aspectRatio < 0.9) return "min(46vw, 52vh, 620px)";
  if (aspectRatio < 1.5) return "min(68vw, 92vh, 980px)";
  return "min(72vw, 1100px)";
};

// —— Reference-carousel constants (DESIGN.md §6) ——
const D = 1350; // perspective distance
const CARD_GAP = 36;
const PEEK = -55; // push the peeking card's edge past the screen boundary
const THICKNESS = [-1.47, -0.73, 0, 0.73, 1.47]; // volumetric glass slab slices

const smooth = (t: number) => t * t * (3 - 2 * t);

export function S5Photography({ localP }: S5Props) {
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const rigRef = useRef<HTMLDivElement>(null);
  const frameId = useRef(0);
  const localPRef = useRef(localP);
  localPRef.current = localP;
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const [metrics, setMetrics] = useState({ cardW: 336, cardH: 211 });
  const [focused, setFocused] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const focusedRef = useRef<number | null>(focused);
  focusedRef.current = focused;

  // Responsive card sizing keeps the previous compact, credit-card-like frame.
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      let cardW = Math.round(w * 0.16 + 130);
      const heightFactor = Math.min(1, Math.max(0.65, h / 850));
      cardW = Math.min(336, Math.max(150, Math.round(cardW * heightFactor)));
      setMetrics({ cardW, cardH: Math.round(cardW / 1.5925) });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Restore the subtle cursor-led tilt from the previous gallery.
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const rx = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ry = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      mouse.current.tx = Math.max(-1, Math.min(1, rx));
      mouse.current.ty = Math.max(-1, Math.min(1, ry));
    };
    const onLeave = () => {
      mouse.current.tx = 0;
      mouse.current.ty = 0;
    };
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // 60fps imperative render loop (reference math; progress bound to SCROLL)
  useEffect(() => {
    const tick = () => {
      if (focusedRef.current !== null) {
        frameId.current = requestAnimationFrame(tick);
        return;
      }

      const lp = localPRef.current;
      const cursor = mouse.current;
      cursor.x += (cursor.tx - cursor.x) * 0.08;
      cursor.y += (cursor.ty - cursor.y) * 0.08;
      const intro = remap(lp, 0, 0.1);
      const browse = remap(lp, 0.1, 0.8);
      const out = remap(lp, 0.8, 0.94);

      // scroll-driven continuous progress with the magnetic dwell:
      // cards pause a beat at dead centre, then accelerate to the next.
      const p = browse * (WORKS.length - 1);
      const rounded = Math.round(p);
      const diff = p - rounded;
      const eased = Math.sign(diff) * Math.pow(Math.abs(diff) * 2, 4.2) / 2;
      const active = rounded + eased;

      const rig = rigRef.current;
      if (rig) {
        rig.style.transform = `translateX(${(out * 130).toFixed(2)}vw)`;
        rig.style.opacity = `${1 - out * 0.35}`;
      }

      const h = window.innerHeight;
      const { cardH } = metrics;

      for (let i = 0; i < WORKS.length; i++) {
        const card = cardsRef.current[i];
        if (!card) continue;

        const offset = i - active; // linear browse (no circular wrap)
        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset) || 1;

        if (absOffset > 3) {
          card.style.visibility = "hidden";
          card.style.pointerEvents = "none";
          card.tabIndex = -1;
          card.setAttribute("aria-hidden", "true");
          continue;
        }
        card.style.visibility = "visible";

        let y = 0;
        let z = 0;
        let rot = 0;

        if (absOffset <= 1) {
          const t = smooth(absOffset);
          y = -sign * (t * (cardH + CARD_GAP));
          z = 400 + t * (220 - 400);
          rot = t * 132;
        } else if (absOffset <= 2) {
          const t = smooth(absOffset - 1);
          const zEnd = -60;
          const sEnd = D / (D - zEnd);
          const yEnd = (h / 2 - PEEK) / sEnd - cardH / 2;
          y = -sign * (cardH + CARD_GAP + t * (yEnd - (cardH + CARD_GAP)));
          z = 220 + t * (zEnd - 220);
          rot = 132 + t * (175 - 132);
        } else {
          const t = smooth(Math.min(absOffset - 2, 1));
          const zStart = -60;
          const sEnd2 = D / (D - zStart);
          const yEnd2 = (h / 2 - PEEK) / sEnd2 - cardH / 2;
          const zEnd3 = -250;
          const sEnd3 = D / (D - zEnd3);
          const yEnd3 = (h / 2 + 100) / sEnd3 + cardH / 2;
          y = -sign * (yEnd2 + t * (yEnd3 - yEnd2));
          z = zStart + t * (zEnd3 - zStart);
          rot = 175 + t * (195 - 175);
        }

        // Only the centred card follows the cursor.
        const centerFactor = Math.max(0, 1 - absOffset);
        const tiltX = -cursor.y * 12 * centerFactor;
        const tiltY = cursor.x * 15 * centerFactor;
        const localRot = -sign * rot;

        // staggered rise-in during the intro beat
        const introOpacity = remap(intro, i * 0.05, i * 0.05 + 0.5);
        const introY = (1 - intro) * (40 + i * 6);

        card.style.zIndex = `${Math.round(z)}`;
        card.style.opacity = `${introOpacity}`;
        card.style.transform =
          `translateY(${(y + introY).toFixed(2)}px) translateZ(${z.toFixed(2)}px) ` +
          `rotateX(${(localRot + tiltX).toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotateZ(-3deg)`;

        // only the centred card is clickable (click → enlarge)
        const clickable = centerFactor > 0.55 && out < 0.15;
        card.style.pointerEvents = clickable ? "auto" : "none";
        card.style.cursor = clickable ? "zoom-in" : "default";
        card.tabIndex = clickable ? 0 : -1;
        card.setAttribute("aria-hidden", clickable ? "false" : "true");
      }

      frameId.current = requestAnimationFrame(tick);
    };
    frameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId.current);
  }, [metrics]);

  const hintOpacity = remap(localP, 0.02, 0.08) * (1 - remap(localP, 0.12, 0.2));

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "#04050a" }}>
      {/* moonlit gallery ambiance */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(55% 55% at 50% 44%, rgba(120,140,185,0.14) 0%, rgba(4,5,10,0) 70%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(80% 80% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.8) 100%)" }} />

      <p
        className="absolute top-[10%] left-[7%] max-w-[15rem] font-mono text-[11px] leading-relaxed tracking-[0.26em] uppercase text-white/65 text-left"
        style={{ opacity: remap(localP, 0.02, 0.1) * (1 - remap(localP, 0.72, 0.86)) }}
      >
        photographs · scenes from this story
      </p>

      {/* 3D camera space */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: `${D}px` }}>
        <div
          ref={rigRef}
          className="relative"
          style={{ width: `${metrics.cardW}px`, height: `${metrics.cardH}px`, transformStyle: "preserve-3d" }}
        >
          {WORKS.map((w, i) => (
            <button
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              type="button"
              aria-label={`Open ${workDescription(w)}`}
              onClick={() => { setFocused(i); setFlipped(false); }}
              className="gallery-card absolute inset-0 border-0 bg-transparent p-0"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "visible" }}
            >
              {THICKNESS.map((zOffset, layerIdx) => {
                const isFront = layerIdx === THICKNESS.length - 1;
                const isBack = layerIdx === 0;

                // middle slices — the milky edge of a real glass slab
                if (!isFront && !isBack) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] pointer-events-none"
                      style={{
                        background: "rgba(222,230,243,0.92)",
                        border: "1px solid rgba(235,241,250,0.95)",
                        transform: `translateZ(${zOffset}px)`,
                      }}
                    />
                  );
                }

                // front face — the work itself under a faux-glass rim
                if (isFront) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none"
                      style={{
                        backgroundColor: "#0c0e14",
                        backgroundImage: `url(${workSrc(w, 640)})`,
                        backgroundPosition: w.objectPosition ?? "center",
                        backgroundSize: "cover",
                        transform: `translateZ(${zOffset}px)`,
                        backfaceVisibility: "hidden",
                        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 24px 60px rgba(0,0,0,0.5)",
                      }}
                    >
                      <FramedWorkImage work={w} alt="" sizes="(max-width: 640px) 75vw, 336px" />
                      {/* faux-glass rim (no backdrop filters inside 3D — DESIGN.md §1.3) */}
                      <div className="glass-rim rounded-[16px]" />
                      {/* soft top sheen */}
                      <div className="absolute inset-x-0 top-0 h-1/3" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0))" }} />
                    </div>
                  );
                }

                // back face — blurred media + dark stripe + mono metadata
                return (
                  <div
                    key={layerIdx}
                    className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none"
                    style={{
                      background: "#0c0e14",
                      transform: `translateZ(${zOffset}px) rotateX(180deg)`,
                      backfaceVisibility: "hidden",
                      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12)",
                    }}
                  >
                    <div className="absolute inset-0" style={{ filter: "blur(16px)", transform: "scale(1.15)", opacity: 0.55 }}>
                      <img
                        src={workSrc(w, 640)}
                        alt=""
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute left-0 right-0 top-4 h-8 bg-black/80 backdrop-blur-none z-10" />
                    <div className="absolute left-5 bottom-4 z-20 font-mono text-left">
                      {w.title ? (
                        <div className="text-[12px] font-medium tracking-[0.12em] text-white/95">{w.title}</div>
                      ) : null}
                      <div className={`${w.title ? "mt-1 text-[9px]" : "text-[12px]"} tracking-wider text-white/75`}>
                        {w.location}
                      </div>
                      <div className="mt-1 text-[9px] tracking-wider text-white/55">{w.taken}</div>
                    </div>
                    <div className="glass-rim rounded-[16px]" />
                  </div>
                );
              })}
            </button>
          ))}
        </div>
      </div>

      {/* browse affordance */}
      <GlassSurface
        frost
        className="absolute left-1/2 bottom-[9%] -translate-x-1/2 rounded-full px-6 py-2"
        style={{ opacity: hintOpacity, pointerEvents: "none" }}
      >
        <p className="font-body text-white/75 text-xs tracking-[0.3em] uppercase">scroll to browse · click to look closer</p>
      </GlassSurface>

      {focused !== null ? (
        <AccessibleDialog
          title={workDialogTitle(WORKS[focused])}
          onClose={() => { setFocused(null); setFlipped(false); }}
          className="accessible-dialog--cool"
          panelClassName="photography-dialog"
        >
          <div style={{ perspective: "1800px" }}>
            <motion.button
              type="button"
              className="gallery-dialog-card relative border-0 bg-transparent p-0"
              aria-pressed={flipped}
              aria-label={flipped ? `Show the image for ${workName(WORKS[focused])}` : `Show details for ${workName(WORKS[focused])}`}
              style={{
                width: dialogWidth(WORKS[focused].aspectRatio),
                aspectRatio: `${WORKS[focused].aspectRatio}`,
                transformStyle: "preserve-3d",
              }}
              initial={{ scale: 0.8, opacity: 0, rotateY: 0 }}
              animate={{ scale: 1, opacity: 1, rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: EXPO }}
              onClick={() => setFlipped((value) => !value)}
            >
              <span
                className="absolute inset-0 rounded-[20px] overflow-hidden"
                style={{ background: "#0c0e14", backfaceVisibility: "hidden", boxShadow: "0 44px 110px rgba(0,0,0,0.62)" }}
              >
                <ResponsiveWorkImage
                  work={WORKS[focused]}
                  alt={WORKS[focused].alt}
                  sizes="(max-width: 1100px) 72vw, 1100px"
                  className="absolute inset-0 h-full w-full object-contain"
                  loading="eager"
                />
                <span className="absolute inset-x-0 top-0 h-1/3" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0))" }} />
                <span className="glass-rim rounded-[20px]" />
              </span>
              <span
                className="absolute inset-0 rounded-[20px] overflow-hidden"
                style={{ background: "#0c0e14", backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: "0 44px 110px rgba(0,0,0,0.62)" }}
              >
                <span className="absolute inset-0" style={{ filter: "blur(22px)", transform: "scale(1.15)", opacity: 0.5 }}>
                  <img
                    src={workSrc(WORKS[focused], 640)}
                    alt=""
                    draggable={false}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </span>
                <span className="absolute left-0 right-0 top-9 h-12 bg-black/80" />
                <span className="absolute left-10 bottom-10 font-mono text-left">
                  {WORKS[focused].title ? (
                    <span className="block text-white text-2xl tracking-[0.1em]">{WORKS[focused].title}</span>
                  ) : null}
                  <span className={`${WORKS[focused].title ? "mt-3 text-sm" : "text-2xl"} block tracking-[0.1em] text-white/80`}>
                    {WORKS[focused].location}
                  </span>
                  <span className="mt-2 block text-[11px] tracking-[0.16em] text-white/60">
                    {WORKS[focused].taken}
                  </span>
                </span>
                <span className="glass-rim rounded-[20px]" />
              </span>
            </motion.button>
          </div>
          <div
            className="font-mono text-center tracking-[0.14em]"
            data-qa-gallery-metadata={workDescription(WORKS[focused])}
          >
            {WORKS[focused].title ? (
              <p className="text-sm text-white/90">{WORKS[focused].title}</p>
            ) : null}
            <p className={`${WORKS[focused].title ? "mt-2" : ""} text-[11px] text-white/70`}>
              {WORKS[focused].location}
            </p>
            <p className="mt-1 text-[10px] text-white/50">{WORKS[focused].taken}</p>
          </div>
          <p className="font-mono text-white/65 text-[11px] tracking-[0.2em] uppercase text-center">
            click to flip · esc to close
          </p>
        </AccessibleDialog>
      ) : null}

    </div>
  );
}
