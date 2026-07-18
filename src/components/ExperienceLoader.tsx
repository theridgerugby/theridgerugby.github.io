import { useEffect, useRef, useState } from "react";
import { POSTERS } from "../lib/media";

interface ExperienceLoaderProps {
  visible: boolean;
  progress: number;
  timedOut: boolean;
}

const DISMISS_MS = 420;

/**
 * The curtain is deliberately plain DOM plus a CSS transition rather than an
 * AnimatePresence exit.
 *
 * This is the one surface that must never fail to leave: it is fixed,
 * full-screen and above everything else, so an exit animation that silently
 * does not run leaves an opaque black page over a perfectly live film. That is
 * exactly what happened with a keyless `motion.div` that declared `initial` and
 * `exit` but no `animate` -- the node simply stayed at opacity 1 forever.
 *
 * The transition drives the fade, and a hard timeout unmounts the node even if
 * `transitionend` never arrives (reduced-motion, interrupted transition, a
 * backgrounded tab).
 */
export function ExperienceLoader({ visible, progress, timedOut }: ExperienceLoaderProps) {
  const percentage = Math.round(progress * 100);
  const [mounted, setMounted] = useState(visible);
  const dismissTimer = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    if (!mounted) return;

    dismissTimer.current = window.setTimeout(() => setMounted(false), DISMISS_MS + 120);
    return () => {
      if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    };
  }, [visible, mounted]);

  if (!mounted) return null;

  return (
    <div
      className={`experience-loader${visible ? "" : " experience-loader--dismissed"}`}
      aria-label={timedOut ? "Opening the film with available media" : "Preparing the film"}
      data-qa-experience-loader={timedOut ? "fallback" : "loading"}
      onTransitionEnd={() => {
        if (!visible) setMounted(false);
      }}
    >
      <img
        src={POSTERS.opening}
        alt=""
        fetchPriority="high"
        decoding="async"
        draggable={false}
      />
      <div className="experience-loader__shade" />
      <div className="experience-loader__status">
        <span>{timedOut ? "Opening with available frames" : "Preparing the first scene"}</span>
        <div
          className="experience-loader__track"
          role="progressbar"
          aria-label="Loading the first scene"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <div
            className="experience-loader__fill"
            style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }}
          />
        </div>
        <output>{percentage.toString().padStart(2, "0")}</output>
      </div>
    </div>
  );
}
