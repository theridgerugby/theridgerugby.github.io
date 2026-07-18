import { useCallback, useEffect, useRef, useState } from "react";
import { POSTERS } from "../lib/media";

export interface OpeningMediaState {
  metadata: boolean;
  firstFrame: boolean;
  bufferedSeconds: number;
  duration: number;
  failed: boolean;
}

const INITIAL_MEDIA_STATE: OpeningMediaState = {
  metadata: false,
  firstFrame: false,
  bufferedSeconds: 0,
  duration: 0,
  failed: false,
};

const MINIMUM_CURTAIN_MS = 300;
const FAIL_OPEN_MS = 12_000;
const HARD_OPEN_MS = 13_000;
const RELEASE_DELAY_MS = 80;
const UNLOCK_DELAY_MS = 460;

/**
 * The curtain only ever moves forward: holding -> releasing -> open.
 *
 * An earlier version tracked `released` and `unlocked` as two independent
 * booleans fed by readiness flags that could flip back to false (a late media
 * event re-reporting `duration: 0` regrows the buffer goal, un-readying an
 * already-ready gate). Any such flip tore down the in-flight release timers and
 * left the pair in a state that should not exist -- curtain still up, input
 * already unlocked -- i.e. a permanently black screen over a live page.
 *
 * Phases are monotonic and readiness is latched, so a transient flip can no
 * longer rewind the opening, and a torn-down timer simply reschedules.
 */
type Phase = "holding" | "releasing" | "open";

const PHASE_ORDER: Record<Phase, number> = { holding: 0, releasing: 1, open: 2 };

export function useCriticalExperience(active: boolean) {
  const [posterReady, setPosterReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [media, setMedia] = useState<OpeningMediaState>(INITIAL_MEDIA_STATE);

  const [phase, setPhase] = useState<Phase>(active ? "holding" : "open");
  const phaseRef = useRef<Phase>(phase);
  const startedAt = useRef<number | null>(null);
  const readyLatch = useRef(false);

  /** Move the curtain forward. Never backward -- that is the whole point. */
  const advance = useCallback((next: Phase) => {
    if (PHASE_ORDER[next] <= PHASE_ORDER[phaseRef.current]) return;
    phaseRef.current = next;
    setPhase(next);
  }, []);

  useEffect(() => {
    if (!active) advance("open");
  }, [active, advance]);

  // Timers are scheduled against absolute deadlines taken from first
  // activation, so a re-run can never push the safety net further away.
  useEffect(() => {
    if (!active) return;

    if (startedAt.current === null) startedAt.current = performance.now();
    const elapsed = performance.now() - startedAt.current;
    const after = (ms: number) => Math.max(0, ms - elapsed);

    const minimumTimer = window.setTimeout(() => setMinimumElapsed(true), after(MINIMUM_CURTAIN_MS));
    const failOpenTimer = window.setTimeout(() => setTimedOut(true), after(FAIL_OPEN_MS));
    // Last resort: whatever else stalls, the film is never unreachable.
    const hardOpenTimer = window.setTimeout(() => advance("open"), after(HARD_OPEN_MS));

    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(failOpenTimer);
      window.clearTimeout(hardOpenTimer);
    };
  }, [active, advance]);

  useEffect(() => {
    if (!active) return;

    const poster = new Image();
    let cancelled = false;
    poster.decoding = "async";
    poster.fetchPriority = "high";
    poster.src = POSTERS.opening;

    const settle = () => {
      if (!cancelled) setPosterReady(true);
    };

    if (poster.complete) {
      poster.decode().catch(() => undefined).finally(settle);
    } else {
      poster.addEventListener("load", () => poster.decode().catch(() => undefined).finally(settle), {
        once: true,
      });
      poster.addEventListener("error", settle, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const localFonts = Promise.all([
      document.fonts.load('300 1em "Spectral"'),
      document.fonts.load('350 1em "Hanken Grotesk"'),
    ]);
    const fontTimeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 3_500);
    });

    Promise.race([localFonts, fontTimeout]).finally(() => {
      if (!cancelled) setFontsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [active]);

  const reportOpeningMedia = useCallback((next: Partial<OpeningMediaState>) => {
    setMedia((current) => ({
      ...current,
      ...next,
      // Both of these must be monotonic. A late event that reports a zero
      // duration would otherwise regrow the buffer goal and un-ready the gate.
      duration: Math.max(current.duration, next.duration ?? 0),
      bufferedSeconds: Math.max(current.bufferedSeconds, next.bufferedSeconds ?? 0),
      metadata: current.metadata || (next.metadata ?? false),
      firstFrame: current.firstFrame || (next.firstFrame ?? false),
      failed: current.failed || (next.failed ?? false),
    }));
  }, []);

  const bufferGoal = media.duration > 0
    ? Math.min(3, Math.max(1.5, media.duration * 0.24))
    : 3;
  const bufferProgress = media.failed
    ? 1
    : Math.min(1, media.bufferedSeconds / bufferGoal);
  const mediaReady = media.failed ||
    (media.metadata && media.firstFrame && bufferProgress >= 1);

  const rawReady = minimumElapsed && (timedOut || (posterReady && fontsReady && mediaReady));
  if (rawReady) readyLatch.current = true;
  const ready = readyLatch.current;

  useEffect(() => {
    if (!active || !ready) return;

    const releaseTimer = window.setTimeout(() => advance("releasing"), RELEASE_DELAY_MS);
    const unlockTimer = window.setTimeout(() => advance("open"), UNLOCK_DELAY_MS);
    return () => {
      window.clearTimeout(releaseTimer);
      window.clearTimeout(unlockTimer);
    };
  }, [active, ready, advance]);

  const released = phase !== "holding";

  const progress = released || timedOut || media.failed
    ? 1
    : Math.min(
        1,
        0.04 +
          (posterReady ? 0.2 : 0) +
          (fontsReady ? 0.12 : 0) +
          (media.metadata ? 0.12 : 0) +
          (media.firstFrame ? 0.17 : 0) +
          bufferProgress * 0.35,
      );

  return {
    progress,
    released,
    unlocked: phase === "open",
    timedOut,
    reportOpeningMedia,
  };
}
