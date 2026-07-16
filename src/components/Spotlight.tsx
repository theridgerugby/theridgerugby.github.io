import { motion } from "framer-motion";

interface SpotlightProps {
  x?: string; // pool centre
  y?: string;
  size?: string;
  tint?: string;
  dust?: number; // floating dust motes inside the beam
  opacity?: number;
  className?: string;
}

/**
 * Spotlight — the shared stage-light pool (DESIGN.md §2.3).
 * One light language across acts: S1 lights the phone, S3 the projector
 * screen, S4 uses its own desk lamp variant.
 */
export function Spotlight({
  x = "50%",
  y = "35%",
  size = "56vw",
  tint = "rgba(195,210,240,0.15)",
  dust = 0,
  opacity = 1,
  className = "",
}: SpotlightProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ opacity }} aria-hidden="true">
      <div
        className="absolute"
        style={{
          left: x,
          top: y,
          width: size,
          height: size,
          transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle, ${tint} 0%, rgba(0,0,0,0) 65%)`,
          filter: "blur(18px)",
        }}
      />
      {dust > 0 &&
        Array.from({ length: dust }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/35"
            style={{
              width: 1.5 + (i % 3),
              height: 1.5 + (i % 3),
              left: `calc(${x} + ${((i * 37) % 40) - 20}vh)`,
              top: `calc(${y} + ${((i * 53) % 36) - 18}vh)`,
            }}
            animate={{ y: [0, -18, 0], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}
    </div>
  );
}
