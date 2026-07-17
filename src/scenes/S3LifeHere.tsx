import { motion } from "framer-motion";
import { remap } from "../lib/timeline";

interface S3Props {
  localP: number;
}

/** A real frame from the family archive, treated like a quiet home-movie reel. */
export function S3LifeHere({ localP }: S3Props) {
  const opacity = Math.min(1, localP * 6);
  const reelFade = 1 - remap(localP, 0.86, 1);

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div
        className="absolute"
        aria-hidden="true"
        style={{
          left: "4%",
          top: "26%",
          width: "72vw",
          height: "48vh",
          clipPath: "polygon(0 46%, 100% 0, 100% 100%, 0 54%)",
          background: "linear-gradient(90deg, rgba(255,238,200,0.28) 0%, rgba(255,238,200,0.1) 45%, rgba(255,238,200,0.02) 100%)",
          filter: "blur(10px)",
          opacity,
        }}
      />

      <div className="absolute inset-0" aria-hidden="true" style={{ opacity: opacity * 0.6 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/40"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${10 + ((i * 37) % 80)}%`,
              top: `${20 + ((i * 53) % 60)}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 5 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        ))}
      </div>

      <figure
        className="relative overflow-hidden bg-black"
        style={{
          width: "min(66vw, 880px)",
          aspectRatio: "4 / 3",
          opacity: opacity * reelFade,
          boxShadow: "0 0 70px rgba(255,240,210,0.1), 0 0 0 2px rgba(255,255,255,0.09)",
        }}
      >
        <img
          src="/media/childhood/2018-07-25 210344.jpg"
          alt="Three children and an adult make faces for a family photograph at the water's edge."
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `scale(1.1) translate3d(${(0.5 - localP) * 2.5}%, ${(0.5 - localP) * 3}%, 0)` }}
          draggable={false}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.58) 100%), linear-gradient(180deg, rgba(255,240,210,0.08), transparent 30%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 px-5 py-4 bg-gradient-to-t from-black/80 to-transparent">
          <figcaption className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/70 text-scrim">
            family archive · Canada · 2018
          </figcaption>
        </div>
      </figure>
    </div>
  );
}
