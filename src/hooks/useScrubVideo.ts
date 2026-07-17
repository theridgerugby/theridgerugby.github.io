import { useEffect, useRef } from "react";

/**
 * Smoothly scrubs a <video> to `targetTime` by coalescing seeks: the next seek
 * is only issued after the previous one has presented (`seeked`). This paces
 * work to the decoder instead of flooding it on every scroll tick. Pair it with
 * a web-sized H.264 rendition, fast-start MP4 layout, and a short closed GOP;
 * all-intra video is unnecessarily large for this interaction.
 */
export function useScrubVideo(
  ref: React.RefObject<HTMLVideoElement | null>,
  targetTime: number
) {
  const st = useRef({ target: 0, seeking: false, seek: () => {} });
  st.current.target = targetTime;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const seek = () => {
      if (!v.duration || st.current.seeking) return;
      const t = Math.min(Math.max(st.current.target, 0), v.duration - 0.033);
      if (Math.abs(v.currentTime - t) > 0.02) {
        st.current.seeking = true;
        try {
          v.currentTime = t;
        } catch {
          st.current.seeking = false;
        }
      }
    };
    st.current.seek = seek;

    const onSeeked = () => {
      st.current.seeking = false;
      seek(); // chase the latest target once the last frame has presented
    };
    v.addEventListener("seeked", onSeeked);
    // kick once metadata is ready
    if (v.readyState >= 1) seek();
    else v.addEventListener("loadedmetadata", seek, { once: true });

    return () => {
      v.removeEventListener("seeked", onSeeked);
    };
  }, [ref]);

  // request a seek toward the newest target on every change
  useEffect(() => {
    st.current.seek();
  }, [targetTime]);
}
