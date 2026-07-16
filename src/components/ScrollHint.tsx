import { GlassButton } from "./Glass";

interface ScrollHintProps {
  opacity: number;
}

/** The "scroll to continue" pill — both a cue and a real keyboard action. */
export function ScrollHint({ opacity }: ScrollHintProps) {
  return (
    <GlassButton
      hover
      disabled={opacity <= 0.05}
      aria-hidden={opacity <= 0.05}
      tabIndex={opacity > 0.05 ? 0 : -1}
      className="absolute left-1/2 bottom-[7%] -translate-x-1/2 rounded-full px-7 py-2.5"
      style={{ opacity, pointerEvents: opacity > 0.05 ? "auto" : "none" }}
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.75, behavior: "smooth" })}
    >
      <span className="font-body text-white/90 text-sm tracking-[0.35em] uppercase text-scrim">
        scroll to continue
      </span>
    </GlassButton>
  );
}
