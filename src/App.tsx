import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExperienceLoader } from "./components/ExperienceLoader";
import { GlassButton, GlassFilterDefs } from "./components/Glass";
import { GrainVignette } from "./components/GrainVignette";
import { ReadingExperience } from "./components/ReadingExperience";
import { StageFrame } from "./components/StageFrame";
import { StagActor, type HeroPlayback } from "./components/StagActor";
import { type OpeningMediaState, useCriticalExperience } from "./hooks/useCriticalExperience";
import { useMediaPrefetch } from "./hooks/useMediaPrefetch";
import { useScrollProgress } from "./hooks/useScrollProgress";
import { S0Overture } from "./scenes/S0Overture";
import { S1TheQuestion } from "./scenes/S1TheQuestion";
import { S2Arrival } from "./scenes/S2Arrival";
import { S3LifeHere } from "./scenes/S3LifeHere";
import { S4BlueMemoirs } from "./scenes/S4BlueMemoirs";
import { S5CameraPrelude } from "./scenes/S5CameraPrelude";
import { S5Photography } from "./scenes/S5Photography";
import { S6Research } from "./scenes/S6Research";
import { S7Curtain } from "./scenes/S7Curtain";
import { SCENE_ORDER, SCENE_RANGES, TOTAL_VH, isSceneActive, localProgress } from "./lib/timeline";

const CROSSFADE = 0.035;
const DIP = 0.012;

type CinematicDestination = "finale" | "research";
type TransitionPhase = "covering" | "revealing";

interface CinematicTransition {
  destination: CinematicDestination;
  phase: TransitionPhase;
}

const READY_HERO: HeroPlayback = { status: "ready", progress: 0 };

function sceneOpacity(p: number, key: (typeof SCENE_ORDER)[number]): number {
  const local = localProgress(p, key);
  const isFirst = key === SCENE_ORDER[0];
  const isLast = key === SCENE_ORDER[SCENE_ORDER.length - 1];
  const fadeIn = isFirst ? 1 : Math.min(1, Math.max(0, (local - DIP) / CROSSFADE));
  const fadeOut = isLast ? 1 : Math.min(1, Math.max(0, (1 - local - DIP) / CROSSFADE));
  return Math.min(fadeIn, fadeOut);
}

function useAutomaticReadingMode() {
  const readPreference = () =>
    window.matchMedia("(max-width: 1023px)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [isReadingMode, setIsReadingMode] = useState(readPreference);

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 1023px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setIsReadingMode(compact.matches || reducedMotion.matches);
    compact.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      compact.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  return isReadingMode;
}

interface CinematicExperienceProps {
  onRead: () => void;
  loading: boolean;
  onOpeningMediaState: (state: Partial<OpeningMediaState>) => void;
}

function CinematicExperience({
  onRead,
  loading,
  onOpeningMediaState,
}: CinematicExperienceProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(trackRef, pinRef, !loading);
  useMediaPrefetch(progress, !loading);
  const pad = 0.035;
  const [transition, setTransition] = useState<CinematicTransition | null>(null);
  const [heroPlayback, setHeroPlayback] = useState<HeroPlayback>(READY_HERO);
  const [skippedToFinale, setSkippedToFinale] = useState(false);
  const transitioning = useRef(false);
  const skipFinaleVisited = useRef(false);
  const heroReady = useRef(false);
  const revealWait = useRef<number | null>(null);
  const [primeHero, setPrimeHero] = useState(false);
  const handleHeroReady = useCallback((ready: boolean) => {
    heroReady.current = ready;
  }, []);

  const seekToScene = useCallback((destination: CinematicDestination) => {
    const track = trackRef.current;
    if (!track) return;

    const sceneKey = destination === "finale" ? "s7" : "s6";
    const localTarget = destination === "finale" ? 0.12 : 0.28;
    const range = SCENE_RANGES.find((candidate) => candidate.key === sceneKey)!;
    const targetProgress = range.start + (range.end - range.start) * localTarget;
    const trackTop = window.scrollY + track.getBoundingClientRect().top;
    const scrollDistance = Math.max(0, track.offsetHeight - window.innerHeight);

    window.scrollTo({
      top: trackTop + scrollDistance * targetProgress,
      left: 0,
      behavior: "auto",
    });
  }, []);

  const navigateTo = useCallback((destination: CinematicDestination) => {
    if (transitioning.current) return;
    transitioning.current = true;
    if (destination === "finale") {
      setPrimeHero(true);
      skipFinaleVisited.current = false;
      setSkippedToFinale(true);
    }
    setTransition({ destination, phase: "covering" });
  }, []);

  useEffect(() => {
    if (!transition) return;

    const preventPointerScroll = (event: WheelEvent | TouchEvent) => event.preventDefault();
    const preventKeyboardScroll = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventPointerScroll, { passive: false });
    window.addEventListener("touchmove", preventPointerScroll, { passive: false });
    window.addEventListener("keydown", preventKeyboardScroll);
    return () => {
      window.removeEventListener("wheel", preventPointerScroll);
      window.removeEventListener("touchmove", preventPointerScroll);
      window.removeEventListener("keydown", preventKeyboardScroll);
    };
  }, [transition]);

  const handleTransitionComplete = useCallback(() => {
    if (!transition) return;

    if (transition.phase === "covering") {
      seekToScene(transition.destination);
      const reveal = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransition((current) => current ? { ...current, phase: "revealing" } : current);
          });
        });
      };

      if (transition.destination === "finale") {
        const deadline = performance.now() + 2_800;
        const revealWhenReady = () => {
          if (heroReady.current || performance.now() >= deadline) {
            reveal();
            return;
          }
          revealWait.current = window.setTimeout(revealWhenReady, 80);
        };
        revealWhenReady();
      } else {
        reveal();
      }
      return;
    }

    const focusId = transition.destination === "finale" ? "finale-title" : "research-01-title";
    setTransition(null);
    transitioning.current = false;
    requestAnimationFrame(() => document.getElementById(focusId)?.focus({ preventScroll: true }));
  }, [seekToScene, transition]);

  useEffect(
    () => () => {
      if (revealWait.current !== null) window.clearTimeout(revealWait.current);
    },
    [],
  );

  const pearsonRange = SCENE_RANGES.find((range) => range.key === "s2")!;
  const finaleRange = SCENE_RANGES.find((range) => range.key === "s7")!;
  const finaleControlVisible = progress < finaleRange.start;

  useEffect(() => {
    if (!skippedToFinale) return;

    if (progress >= finaleRange.start) {
      skipFinaleVisited.current = true;
      return;
    }

    if (skipFinaleVisited.current && progress <= pearsonRange.end) {
      skipFinaleVisited.current = false;
      setSkippedToFinale(false);
    }
  }, [finaleRange.start, pearsonRange.end, progress, skippedToFinale]);

  const layerProps = (key: (typeof SCENE_ORDER)[number], zIndex: number) => {
    const opacity = sceneOpacity(progress, key);
    return {
      "aria-hidden": opacity < 0.12,
      inert: opacity < 0.12,
      className: "scene-layer absolute inset-0",
      style: { zIndex, opacity, pointerEvents: opacity > 0.15 ? ("auto" as const) : ("none" as const) },
    };
  };

  return (
    <>
      <button type="button" className="experience-switch" onClick={onRead}>
        Read this story without motion
      </button>
      <main className="app-root">
        <h1 id="cinematic-title" tabIndex={-1} className="sr-only">Ethan Gan — an autobiographical film</h1>
        <div ref={trackRef} style={{ height: `${TOTAL_VH * 100}vh`, position: "relative" }}>
          <div ref={pinRef} className="cinematic-stage overflow-hidden bg-black" style={{ width: "100%", height: "100vh" }}>
            {isSceneActive(progress, "s0", pad) && (
              <div {...layerProps("s0", 0)}>
                <S0Overture
                  localP={localProgress(progress, "s0")}
                  onOpeningMediaState={onOpeningMediaState}
                />
              </div>
            )}
            {isSceneActive(progress, "s1", pad) && (
              <div {...layerProps("s1", 1)}><S1TheQuestion localP={localProgress(progress, "s1")} /></div>
            )}
            {isSceneActive(progress, "s2", pad) && (
              <div {...layerProps("s2", 2)}><S2Arrival localP={localProgress(progress, "s2")} /></div>
            )}
            {isSceneActive(progress, "s3", pad) && (
              <div {...layerProps("s3", 3)}><S3LifeHere localP={localProgress(progress, "s3")} /></div>
            )}
            {isSceneActive(progress, "s4", pad) && (
              <div {...layerProps("s4", 4)}><S4BlueMemoirs localP={localProgress(progress, "s4")} /></div>
            )}
            {isSceneActive(progress, "s5Prelude", pad) && (
              <div {...layerProps("s5Prelude", 5)}><S5CameraPrelude localP={localProgress(progress, "s5Prelude")} /></div>
            )}
            {isSceneActive(progress, "s5", pad) && (
              <div {...layerProps("s5", 6)}><S5Photography localP={localProgress(progress, "s5")} /></div>
            )}
            {isSceneActive(progress, "s6", pad) && (
              <div {...layerProps("s6", 7)}><S6Research localP={localProgress(progress, "s6")} /></div>
            )}
            {isSceneActive(progress, "s7", pad) && (
              <div {...layerProps("s7", 8)}>
                <S7Curtain
                  heroPlayback={heroPlayback}
                  arrivedViaSkip={skippedToFinale}
                  onResearch={() => navigateTo("research")}
                  onReplay={() => {
                    skipFinaleVisited.current = false;
                    setSkippedToFinale(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <StageFrame progress={progress} />
      {finaleControlVisible ? (
        <GlassButton
          frost
          onClick={() => navigateTo("finale")}
          disabled={transition !== null}
          aria-label="Skip directly to the final scene"
          className="fixed right-6 top-6 z-[800] min-h-11 rounded-full px-4 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/70 hover:text-white"
          data-qa-finale-control="visible"
        >
          Skip
        </GlassButton>
      ) : null}
      <StagActor
        progress={progress}
        suppressMotion={transition !== null}
        primeHero={primeHero}
        onHeroPlayback={setHeroPlayback}
        onHeroReady={handleHeroReady}
      />
      <GrainVignette />
      {transition ? (
        <motion.div
          className="fixed inset-0 z-[1100] bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: transition.phase === "covering" ? 1 : 0 }}
          transition={{
            duration: transition.phase === "covering" ? 0.5 : 0.62,
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={handleTransitionComplete}
          data-qa-cinematic-transition={transition.phase}
          aria-hidden="true"
        />
      ) : null}
      <div
        data-qa-progress={progress.toFixed(4)}
        aria-hidden="true"
        style={{ position: "fixed", width: 0, height: 0, overflow: "hidden" }}
      />
    </>
  );
}

function App() {
  const automaticReadingMode = useAutomaticReadingMode();
  const [manualReadingMode, setManualReadingMode] = useState(false);
  const showReadingMode = automaticReadingMode || manualReadingMode;
  const previousReadingMode = useRef<boolean | null>(null);
  const loaderActive = !showReadingMode;
  const {
    progress: loadingProgress,
    released: loaderReleased,
    unlocked: loaderUnlocked,
    timedOut: loaderTimedOut,
    reportOpeningMedia,
  } = useCriticalExperience(loaderActive);
  const interactionLocked = loaderActive && !loaderUnlocked;

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.toggle("cinematic-scrollbar", !showReadingMode);
    root.classList.toggle("reading-scroll", showReadingMode);

    if (showReadingMode) {
      root.classList.remove("experience-loading");
      if (root.style.overflow === "hidden") root.style.removeProperty("overflow");
      if (body.style.overflow === "hidden") body.style.removeProperty("overflow");
      if (body.style.touchAction === "none") body.style.removeProperty("touch-action");
    }
    if (previousReadingMode.current !== null && previousReadingMode.current !== showReadingMode) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      requestAnimationFrame(() => {
        document
          .getElementById(showReadingMode ? "reading-title" : "cinematic-title")
          ?.focus({ preventScroll: true });
      });
    }
    previousReadingMode.current = showReadingMode;

    return () => {
      root.classList.remove("cinematic-scrollbar");
      root.classList.remove("reading-scroll");
    };
  }, [showReadingMode]);

  useEffect(() => {
    if (!interactionLocked) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;
    const previousRestoration = window.history.scrollRestoration;
    const preventPointerScroll = (event: WheelEvent | TouchEvent) => event.preventDefault();
    const preventKeyboardScroll = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.history.scrollRestoration = "manual";
    root.classList.add("experience-loading");
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.addEventListener("wheel", preventPointerScroll, { passive: false });
    window.addEventListener("touchmove", preventPointerScroll, { passive: false });
    window.addEventListener("keydown", preventKeyboardScroll);

    return () => {
      root.classList.remove("experience-loading");
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousTouchAction;
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("wheel", preventPointerScroll);
      window.removeEventListener("touchmove", preventPointerScroll);
      window.removeEventListener("keydown", preventKeyboardScroll);
    };
  }, [interactionLocked]);

  useEffect(() => {
    if (!loaderActive || !loaderUnlocked) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      document.getElementById("cinematic-title")?.focus({ preventScroll: true });
    });
  }, [loaderActive, loaderUnlocked]);

  return (
    <>
      <GlassFilterDefs />
      {showReadingMode ? (
        <>
          <ReadingExperience
            canReturnToCinema={!automaticReadingMode}
            onReturnToCinema={() => setManualReadingMode(false)}
          />
          <GrainVignette />
        </>
      ) : (
        <div inert={interactionLocked} aria-hidden={interactionLocked}>
          <CinematicExperience
            onRead={() => setManualReadingMode(true)}
            loading={interactionLocked}
            onOpeningMediaState={reportOpeningMedia}
          />
        </div>
      )}
      <ExperienceLoader
        visible={loaderActive && !loaderReleased}
        progress={loadingProgress}
        timedOut={loaderTimedOut}
      />
    </>
  );
}

export default App;
