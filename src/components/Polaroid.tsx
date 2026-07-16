import type { CSSProperties } from "react";

interface PolaroidProps {
  src: string;
  alt?: string;
  caption?: string;
  wide?: boolean; // landscape 16:9 window instead of the square default
  className?: string;
  style?: CSSProperties;
}

/**
 * Polaroid — real Polaroid print proportions: a thin top/side border and a thick
 * bottom border framing the image window. Default window is SQUARE (classic
 * Polaroid 600); `wide` gives a 16:9 landscape window (used only for the ribs
 * freeze — the one rectangular photo in the set). Caller sets the width.
 */
export function Polaroid({ src, alt = "", caption, wide = false, className = "", style }: PolaroidProps) {
  return (
    <div
      className={`bg-[#f6f2e9] ${className}`}
      style={{
        padding: wide ? "4.5% 4.5% 12% 4.5%" : "6.5% 6.5% 22% 6.5%",
        borderRadius: "3px",
        boxShadow: "0 14px 34px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: wide ? "16 / 9" : "1 / 1" }}
      >
        <img src={src} alt={alt} draggable={false} className="w-full h-full object-cover" />
      </div>
      {caption ? (
        <div className="text-center text-[#3a3428] font-body text-[0.7rem] mt-[6%] opacity-70">{caption}</div>
      ) : null}
    </div>
  );
}
