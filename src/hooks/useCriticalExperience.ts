import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const MINIMUM_CURTAIN_MS = 900;
const FAIL_OPEN_MS = 12_000;

export function useCriticalExperience(active: boolean) {
  const [posterReady, setPosterReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [released, setReleased] = useState(!active);
  const [unlocked, setUnlocked] = useState(!active);
  const [media, setMedia] = useState<OpeningMediaState>(INITIAL_MEDIA_STATE);
  const hasOpened = useRef(false);

  useEffect(() => {
    if (!active || hasOpened.current) {
      setReleased(true);
      setUnlocked(true);
      return;
    }

    setReleased(false);
    setUnlocked(false);
    const minimumTimer = window.setTimeout(() => setMinimumElapsed(true), MINIMUM_CURTAIN_MS);
    const failOpenTimer = window.setTimeout(() => setTimedOut(true), FAIL_OPEN_MS);

    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(failOpenTimer);
    };
  }, [active]);

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
      bufferedSeconds: Math.max(current.bufferedSeconds, next.bufferedSeconds ?? 0),
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

  const progress = useMemo(() => {
    if (!active || released) return 1;
    if (timedOut || media.failed) return 1;

    return Math.min(
      0.98,
      0.04 +
        (posterReady ? 0.2 : 0) +
        (fontsReady ? 0.12 : 0) +
        (media.metadata ? 0.12 : 0) +
        (media.firstFrame ? 0.17 : 0) +
        bufferProgress * 0.35,
    );
  }, [
    active,
    bufferProgress,
    fontsReady,
    media.firstFrame,
    media.failed,
    media.metadata,
    posterReady,
    released,
    timedOut,
  ]);

  const readyToRelease = minimumElapsed && (timedOut || (posterReady && fontsReady && mediaReady));

  useEffect(() => {
    if (!active || unlocked || !readyToRelease) return;

    const releaseTimer = window.setTimeout(() => setReleased(true), 420);
    const unlockTimer = window.setTimeout(() => {
      hasOpened.current = true;
      setUnlocked(true);
    }, 1_160);
    return () => {
      window.clearTimeout(releaseTimer);
      window.clearTimeout(unlockTimer);
    };
  }, [active, readyToRelease, unlocked]);

  return {
    progress,
    released,
    unlocked,
    timedOut,
    reportOpeningMedia,
  };
}
