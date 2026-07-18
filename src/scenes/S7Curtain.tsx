import { RotateCcw } from "lucide-react";
import { GlassButton, GlassLink } from "../components/Glass";
import type { HeroPlayback } from "../components/StagActor";
import { remap } from "../lib/timeline";

interface S7Props {
  heroPlayback: HeroPlayback;
  arrivedViaSkip: boolean;
  onResearch: () => void;
  onReplay: () => void;
}

/**
 * S7 · Curtain — black stage; the A3 hero run autoplays full-frame in the
 * StagActor overlay; the signature line settles over it.
 */
export function S7Curtain({
  heroPlayback,
  arrivedViaSkip,
  onResearch,
  onReplay,
}: S7Props) {
  const fallback = heroPlayback.status === "ended" || heroPlayback.status === "failed";
  const signature = fallback ? 1 : remap(heroPlayback.progress, 0.16, 0.5);
  const actions = fallback ? 1 : remap(heroPlayback.progress, 0.7, 0.94);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: signature }}
      >
        <div className="relative px-12 py-6">
          <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(55% 110% at 50% 50%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 78%)" }} />
          <h2
            id="finale-title"
            tabIndex={-1}
            className="font-heading italic font-light text-white text-6xl tracking-[-0.02em] text-center leading-tight outline-none"
          >
            {arrivedViaSkip ? "Ethan Gan" : "So, yeah—this is me. Ethan Gan."}
          </h2>
          <p className="mt-3 text-center font-heading italic font-light text-lg tracking-[0.035em] text-white/65">
            {arrivedViaSkip
              ? "come back for the whole story when you have time:)"
              : "thanks for watching."}
          </p>
        </div>
      </div>
      <div
        className="absolute left-1/2 top-[66%] -translate-x-1/2 flex items-center gap-3"
        aria-hidden={actions <= 0.5}
        inert={actions <= 0.5}
        style={{ opacity: actions, pointerEvents: actions > 0.5 ? "auto" : "none" }}
        data-qa-finale-actions={actions > 0.5 ? "visible" : "hidden"}
      >
        <GlassButton
          frost
          className="rounded-full px-5 py-2.5 font-body text-sm tracking-[0.08em] text-white whitespace-nowrap"
          onClick={onResearch}
          aria-label="Go to the research scene"
        >
          Back to my research
        </GlassButton>
        <GlassLink
          frost
          href="https://github.com/theridgerugby"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub (opens in a new tab)"
          className="rounded-full px-5 py-2.5 font-body text-sm tracking-[0.08em] text-white"
        >
          GitHub
        </GlassLink>
        <GlassLink
          frost
          href="mailto:ethan.gan@mail.utoronto.ca"
          aria-label="Email Ethan Gan at ethan.gan@mail.utoronto.ca"
          className="rounded-full px-5 py-2.5 font-body text-sm tracking-[0.08em] text-white"
        >
          Email
        </GlassLink>
        <GlassButton
          frost
          className="rounded-full px-5 py-2.5 font-body text-sm tracking-[0.08em] text-white"
          onClick={onReplay}
        >
          <RotateCcw size={16} strokeWidth={1.7} aria-hidden="true" />
          Replay
        </GlassButton>
      </div>
    </div>
  );
}
