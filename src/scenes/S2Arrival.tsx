import { useRef } from "react";
import { useScrubVideo } from "../hooks/useScrubVideo";

const PEARSON_DURATION = 23.15; // pearson.mp4 length (full 4K, all-intra for smooth scrub)

interface S2Props {
  localP: number; // 0..1 within S2 — drives the rightward pan by scroll
}

/**
 * S2 Arrival — Pearson immigration hall. Like S0, the footage is bound to scroll:
 * the camera's rightward pan is driven by wheel progress, not autoplay. Coalesced
 * seeking (useScrubVideo) keeps the 4K scrub smooth without downscaling.
 */
export function S2Arrival({ localP }: S2Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useScrubVideo(videoRef, localP * PEARSON_DURATION);

  return (
    <div className="absolute inset-0 bg-black">
      <video
        ref={videoRef}
        src="/media/pearson.mp4"
        poster="/media/gallery/arrival.jpg"
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <p className="sr-only">Arrival at the Immigration and Customs hall at Toronto Pearson airport.</p>
    </div>
  );
}
