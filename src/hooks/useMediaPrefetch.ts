import { useEffect, useRef } from "react";
import { MEDIA, POLAROID_SOURCES, preferredHeroSource } from "../lib/media";
import { SCENE_RANGES } from "../lib/timeline";

interface PrefetchStage {
  threshold: number;
  assets: () => Array<{ source: string; as: "image" | "video" }>;
}

const sceneStart = (key: "s1" | "s3" | "s6") =>
  SCENE_RANGES.find((range) => range.key === key)!.start;

const PREFETCH_STAGES: PrefetchStage[] = [
  {
    threshold: 0.08,
    assets: () => [
      { source: MEDIA.stagRun, as: "video" },
      { source: MEDIA.stagIdle, as: "video" },
    ],
  },
  {
    threshold: sceneStart("s1"),
    assets: () => [{ source: MEDIA.arrival, as: "video" }],
  },
  {
    threshold: sceneStart("s3"),
    assets: () => [
      { source: MEDIA.ribs, as: "video" },
      ...POLAROID_SOURCES.map((source) => ({ source, as: "image" as const })),
    ],
  },
  {
    threshold: sceneStart("s6"),
    assets: () => [{ source: preferredHeroSource(), as: "video" }],
  },
];

export function useMediaPrefetch(progress: number, enabled: boolean) {
  const primed = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled) return;

    for (const stage of PREFETCH_STAGES) {
      if (progress < stage.threshold) continue;

      for (const { source, as } of stage.assets()) {
        if (primed.current.has(source)) continue;
        const alreadyInDocument = Array.from(
          document.querySelectorAll<HTMLLinkElement>("link[data-cinematic-prefetch]"),
        ).some((link) => link.dataset.cinematicPrefetch === source);
        primed.current.add(source);
        if (alreadyInDocument) continue;

        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = as;
        link.href = source;
        link.dataset.cinematicPrefetch = source;
        document.head.appendChild(link);
      }
    }
  }, [enabled, progress]);
}
