import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";

/**
 * Pins `pinRef` for the height of `trackRef` and reports global scroll
 * progress (0..1) across that pinned duration.
 */
export function useScrollProgress(
  trackRef: React.RefObject<HTMLElement | null>,
  pinRef: React.RefObject<HTMLElement | null>,
  enabled = true,
) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const pendingProgressRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!trackRef.current || !pinRef.current) return;

    const st = ScrollTrigger.create({
      trigger: trackRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: pinRef.current,
      pinSpacing: false,
      scrub: 0.24,
      onUpdate: (self) => {
        pendingProgressRef.current = self.progress;
        if (frameRef.current !== null) return;

        frameRef.current = window.requestAnimationFrame(() => {
          frameRef.current = null;
          const nextProgress = pendingProgressRef.current;
          if (Math.abs(nextProgress - progressRef.current) < 0.00001) return;
          progressRef.current = nextProgress;
          setProgress(nextProgress);
        });
      },
    });

    // The track height is explicit, so one post-layout refresh plus late font
    // and load events is enough. Repeated timed refreshes caused visible hitches.
    const refresh = () => ScrollTrigger.refresh();
    const refreshFrame = window.requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      window.removeEventListener("load", refresh);
      st.kill();
    };
  }, [enabled, pinRef, trackRef]);

  return progress;
}

export { gsap };
