import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";

/**
 * Pins `pinRef` for the height of `trackRef` and reports global scroll
 * progress (0..1) across that pinned duration.
 */
export function useScrollProgress(
  trackRef: React.RefObject<HTMLElement | null>,
  pinRef: React.RefObject<HTMLElement | null>
) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    if (!trackRef.current || !pinRef.current) return;

    const st = ScrollTrigger.create({
      trigger: trackRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: pinRef.current,
      pinSpacing: false,
      scrub: 0.4,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        setProgress(self.progress);
      },
    });

    // The scroll track is 15 viewports of mostly-async content (fonts, videos,
    // the 4K pearson clip). If ScrollTrigger measures before that lays out, the
    // pin collapses and progress saturates. Recompute once layout settles and
    // whenever late assets finish loading.
    const refresh = () => ScrollTrigger.refresh();
    const timers = [setTimeout(refresh, 150), setTimeout(refresh, 600), setTimeout(refresh, 1600)];
    window.addEventListener("load", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", refresh);
      st.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return progress;
}

export { gsap };
