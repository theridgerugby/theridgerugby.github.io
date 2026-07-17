import { useCallback, useEffect, useRef, useState } from "react";
import { MEDIA, POSTERS, preferredHeroSource } from "../lib/media";
import { SCENE_RANGES } from "../lib/timeline";

const ACTIVITY_EPSILON = 0.00001;
const STOP_DELAY_MS = 2000;
type CompanionPhase = "resting" | "running" | "settling";

interface StagActorProps {
  progress: number; // global 0..1
  suppressMotion?: boolean;
  primeHero?: boolean;
  onHeroPlayback?: (playback: HeroPlayback) => void;
  onHeroReady?: (ready: boolean) => void;
}

export type HeroPlaybackStatus = "ready" | "playing" | "ended" | "failed";

export interface HeroPlayback {
  status: HeroPlaybackStatus;
  progress: number;
}

/**
 * StagActor v3 — ONE fixed, bottom-anchored overlay (mix-blend-mode: screen),
 * never part of any scene.
 *
 * MOTION RULE (user): any meaningful master-scroll movement runs A2. Once the
 * input has been quiet for a short beat, B plays once to settle the stag. New
 * movement interrupts B immediately and returns to A2.
 *
 * NO-JUMP RULE: B is calibrated to A2 from measurements of the 4K sources
 * (stag body height & hoof line): scale 0.734, translate(-2.4%, -12.7%),
 * origin bottom-center — so the standing stag occupies exactly the running
 * stag's footprint. Motion returns in 160ms; settling crossfades in 350ms.
 */
export function StagActor({
  progress,
  suppressMotion = false,
  primeHero = false,
  onHeroPlayback,
  onHeroReady,
}: StagActorProps) {
  const s0 = SCENE_RANGES.find((r) => r.key === "s0")!;
  const s6 = SCENE_RANGES.find((r) => r.key === "s6")!;
  const s7 = SCENE_RANGES.find((r) => r.key === "s7")!;

  const handoff = s0.end;
  const finaleStart = s7.start + (s7.end - s7.start) * 0.08;
  const hidden = progress < handoff; // baked into the WORLD footage during S0
  const inFinale = progress >= finaleStart;
  const companionPrimed = progress >= handoff - 0.045;
  const heroPrimed = primeHero || progress >= s6.start || inFinale;

  // ---- scroll activity detection ----
  const [companionPhase, setCompanionPhase] = useState<CompanionPhase>("resting");
  const handleSettled = useCallback(() => setCompanionPhase("resting"), []);
  const last = useRef(progress);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (suppressMotion || hidden || inFinale) {
      last.current = progress;
      setCompanionPhase("resting");
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
      return;
    }

    const distance = Math.abs(progress - last.current);
    last.current = progress;
    if (distance < ACTIVITY_EPSILON) return;

    setCompanionPhase("running");
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setCompanionPhase("settling");
      timer.current = null;
    }, STOP_DELAY_MS);
  }, [hidden, inFinale, progress, suppressMotion]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const movingNow = companionPhase === "running";
  const companionOpacity = hidden || inFinale ? 0 : 1;

  const heightVh = 12;

  return (
    <>
      {/* Companion — fixed spot on the stage apron */}
      <div
        className="fixed z-40 pointer-events-none"
        style={{
          left: "18%",
          bottom: "-2vh",
          transform: "translateX(-50%)",
          height: `${heightVh}vh`,
          width: `${heightVh * 1.6}vh`,
          opacity: companionOpacity,
          transition: "opacity 0.5s ease",
          mixBlendMode: "screen",
        }}
        data-qa-stag-state={movingNow ? "running" : "resting"}
        data-qa-stag-phase={companionPhase}
        aria-hidden="true"
      >
        {companionPrimed && !inFinale && (
          <CompanionVideo
            phase={companionPhase}
            onSettled={handleSettled}
          />
        )}
      </div>

      {/* A3 is preloaded, then plays through once when the finale is reached. */}
      <HeroClip active={inFinale} prime={heroPrimed} onPlayback={onHeroPlayback} onReady={onHeroReady} />
    </>
  );
}

function CompanionVideo({
  phase,
  onSettled,
}: {
  phase: CompanionPhase;
  onSettled: () => void;
}) {
  const runRef = useRef<HTMLVideoElement>(null);
  const idleRef = useRef<HTMLVideoElement>(null);
  const [runFailed, setRunFailed] = useState(false);
  const [idleFailed, setIdleFailed] = useState(false);
  const running = phase === "running";
  const settling = phase === "settling";
  const crossfade = running ? "opacity 0.16s ease-out" : "opacity 0.35s ease";

  useEffect(() => {
    const runVideo = runRef.current;
    const stopVideo = idleRef.current;
    if (!runVideo || !stopVideo) return;

    if (phase === "running") {
      stopVideo.pause();
      stopVideo.currentTime = 0;
      runVideo.play().catch(() => {});
      return;
    }

    runVideo.pause();
    if (phase === "settling") {
      stopVideo.currentTime = 0;
      stopVideo.play().catch(() => {
        setIdleFailed(true);
        onSettled();
      });
      return;
    }

    stopVideo.pause();
    stopVideo.currentTime = 0;
  }, [onSettled, phase]);

  return (
    <>
      <img
        src={POSTERS.stagRun}
        alt=""
        className="absolute inset-0 w-full h-full object-contain object-bottom"
        style={{ opacity: running ? 1 : 0, transition: crossfade }}
        draggable={false}
      />
      <img
        src={POSTERS.stagIdle}
        alt=""
        className="absolute inset-0 w-full h-full object-contain object-bottom"
        style={{
          opacity: settling && !idleFailed ? 0 : running ? 0 : 1,
          transition: crossfade,
          transformOrigin: "50% 100%",
          transform: "translateX(-2.4%) translateY(-12.7%) scale(0.734)",
        }}
        draggable={false}
      />
      {/* A2 - gallop while scroll input is active */}
      <video
        ref={runRef}
        src={MEDIA.stagRun}
        data-stag-video="running"
        poster={POSTERS.stagRun}
        muted loop playsInline
        preload="auto"
        onError={() => setRunFailed(true)}
        className="absolute inset-0 w-full h-full object-contain object-bottom"
        style={{ opacity: running && !runFailed ? 1 : 0, transition: crossfade }}
      />
      {/* B - one-shot settling clip; calibrated to A2 size and hoof line */}
      <video
        ref={idleRef}
        src={MEDIA.stagIdle}
        data-stag-video="stopping"
        poster={POSTERS.stagIdle}
        muted playsInline
        preload="auto"
        onEnded={onSettled}
        onError={() => {
          setIdleFailed(true);
          onSettled();
        }}
        className="absolute inset-0 w-full h-full object-contain object-bottom"
        style={{
          opacity: settling && !idleFailed ? 1 : 0,
          transition: crossfade,
          transformOrigin: "50% 100%",
          transform: "translateX(-2.4%) translateY(-12.7%) scale(0.734)",
        }}
      />
    </>
  );
}

function HeroClip({
  active,
  prime,
  onPlayback,
  onReady,
}: {
  active: boolean;
  prime: boolean;
  onPlayback?: (playback: HeroPlayback) => void;
  onReady?: (ready: boolean) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [source, setSource] = useState(preferredHeroSource);
  const lastAdvanceAt = useRef(Date.now());

  useEffect(() => {
    const video = ref.current;
    if (!video || !prime) return;
    onReady?.(false);
    video.preload = "auto";
    video.load();
  }, [onReady, prime, source]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (!active) {
      video.pause();
      video.currentTime = 0;
      setFailed(false);
      onPlayback?.({ status: "ready", progress: 0 });
      return;
    }

    video.currentTime = 0;
    setFailed(false);
    onPlayback?.({ status: "playing", progress: 0 });
    video.play().catch(() => {
      setFailed(true);
      onPlayback?.({ status: "failed", progress: 1 });
    });
  }, [active, onPlayback, source]);

  useEffect(() => {
    if (!active || failed) return;
    lastAdvanceAt.current = Date.now();
    const watchdog = window.setInterval(() => {
      const video = ref.current;
      if (!video || video.ended) return;
      if (Date.now() - lastAdvanceAt.current < 7_000) return;
      video.pause();
      setFailed(true);
      onPlayback?.({ status: "failed", progress: 1 });
    }, 1_000);
    return () => window.clearInterval(watchdog);
  }, [active, failed, onPlayback, source]);

  const reportProgress = () => {
    const video = ref.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    lastAdvanceAt.current = Date.now();
    onPlayback?.({
      status: "playing",
      progress: Math.min(1, Math.max(0, video.currentTime / video.duration)),
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none"
      style={{
        opacity: active ? 1 : 0,
        transition: "opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
        mixBlendMode: "screen",
      }}
      data-qa-stag-hero={active ? "active" : "ready"}
      aria-hidden="true"
    >
      <img
        src={POSTERS.stagHero}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <video
        ref={ref}
        data-stag-video="hero"
        poster={POSTERS.stagHero}
        muted
        playsInline
        preload={prime ? "auto" : "metadata"}
        onLoadedData={() => onReady?.(true)}
        onCanPlay={() => onReady?.(true)}
        onTimeUpdate={reportProgress}
        onEnded={() => onPlayback?.({ status: "ended", progress: 1 })}
        onError={() => {
          if (source !== MEDIA.stagHeroSdr) {
            onReady?.(false);
            setSource(MEDIA.stagHeroSdr);
            setFailed(false);
            return;
          }
          onReady?.(true);
          setFailed(true);
          onPlayback?.({ status: "failed", progress: 1 });
        }}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: failed ? 0 : 1 }}
        src={source}
      />
    </div>
  );
}
