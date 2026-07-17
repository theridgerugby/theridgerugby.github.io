import { useRef } from "react";
import { BlurText } from "../components/BlurText";
import { ScrollHint } from "../components/ScrollHint";
import { useScrubVideo } from "../hooks/useScrubVideo";
import { remap } from "../lib/timeline";

const WORLD_DURATION = 9.87; // stay just inside the precise clip's final frame

interface S0Props {
  localP: number; // 0..1 within S0
}

export function S0Overture({ localP }: S0Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // The world video finishes scrubbing by 0.78 (so the full vault plays); the
  // remaining 0.78→1.0 is the black hold + closing line.
  const VIDEO_END_P = 0.78;
  useScrubVideo(videoRef, remap(localP, 0, VIDEO_END_P) * WORLD_DURATION);

  const hintOpacity = 1 - remap(localP, 0, 0.06);
  // dad text rides the lavender-field segment (~currentTime 5–8s → localP 0.37–0.59)
  const dadTextOpacity = remap(localP, 0.38, 0.44) * (1 - remap(localP, 0.58, 0.64));

  // Ending: once the vault has fully played (0.78) the picture CUTS to black
  // instantly (hard cut, no flash); the black holds, then the closing line fades.
  const blackout = localP >= VIDEO_END_P ? 1 : 0;
  const endLineOpacity = remap(localP, 0.9, 0.96);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        src="/media/world.mp4"
        poster="/media/gallery/overture-precise.jpg"
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Scroll hint — centred pill; prismatic edge + hover refraction */}
      <ScrollHint opacity={hintOpacity} />

      {/* Lavender/run segment text — top-right zone */}
      <div
        className="absolute right-16 top-20 max-w-md text-right"
        style={{ opacity: dadTextOpacity, pointerEvents: "none" }}
      >
        <BlurText
          text="My dad loves photographing our family. His pictures became my memory of years I was too young to remember."
          progress={remap(localP, 0.38, 0.56)}
          className="font-body text-white/90 text-xl leading-relaxed text-scrim"
        />
      </div>

      {/* Hard cut to black — no flash, no fade */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity: blackout }}
      />

      {/* Closing line — appears all at once on the black (no left-to-right reveal) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: endLineOpacity, pointerEvents: "none" }}
      >
        <p className="font-heading italic font-light text-white text-6xl tracking-[0.015em] text-scrim text-center">
          and then, my childhood ended
        </p>
      </div>
    </div>
  );
}
