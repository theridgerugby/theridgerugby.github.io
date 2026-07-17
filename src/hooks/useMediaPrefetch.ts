import { useEffect, useRef } from "react";
import { MEDIA, preferredHeroSource } from "../lib/media";
import { SCENE_RANGES } from "../lib/timeline";

interface PrefetchStage {
  threshold: number;
  sources: () => string[];
}

const sceneStart = (key: "s1" | "s3" | "s6") =>
  SCENE_RANGES.find((range) => range.key === key)!.start;

const PREFETCH_STAGES: PrefetchStage[] = [
  {
    threshold: 0.08,
    sources: () => [MEDIA.stagRun, MEDIA.stagIdle],
  },
  {
    threshold: sceneStart("s1"),
    sources: () => [MEDIA.arrival],
  },
  {
    threshold: sceneStart("s3"),
    sources: () => [MEDIA.ribs],
  },
  {
    threshold: sceneStart("s6"),
    sources: () => [preferredHeroSource()],
  },
];

export function useMediaPrefetch(progress: number, enabled: boolean) {
  const primed = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled) return;

    for (const stage of PREFETCH_STAGES) {
      if (progress < stage.threshold) continue;

      for (const source of stage.sources()) {
        if (primed.current.has(source)) continue;
        const alreadyInDocument = Array.from(
          document.querySelectorAll<HTMLLinkElement>("link[data-cinematic-prefetch]"),
        ).some((link) => link.dataset.cinematicPrefetch === source);
        primed.current.add(source);
        if (alreadyInDocument) continue;

        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "video";
        link.href = source;
        link.dataset.cinematicPrefetch = source;
        document.head.appendChild(link);
      }
    }
  }, [enabled, progress]);
}
