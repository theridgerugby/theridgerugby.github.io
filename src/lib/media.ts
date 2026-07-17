export const MEDIA = {
  opening: "/media/world-1080p-scrub.mp4",
  arrival: "/media/pearson-1080p-scrub.mp4",
  ribs: "/media/ribs.mp4",
  stagRun: "/media/stag-run-720p.mp4",
  stagIdle: "/media/stag-idle-720p.mp4",
  stagHeroHdr: "/media/stag-hero-hdr.mp4",
  stagHeroSdr: "/media/stag-hero-sdr-hable.mp4",
} as const;

export const POSTERS = {
  opening: "/media/gallery/overture-precise.jpg",
  arrival: "/media/gallery/arrival.jpg",
  ribs: "/media/desk/ribs-freeze.jpg",
  stagRun: "/media/gallery/guide.jpg",
  stagIdle: "/media/gallery/idle.jpg",
  stagHero: "/media/gallery/curtain.jpg",
} as const;

export function preferredHeroSource(): string {
  if (typeof window === "undefined") return MEDIA.stagHeroSdr;

  const hdrDisplay = window.matchMedia("(dynamic-range: high)").matches;
  const probe = document.createElement("video");
  const supportsHevc = probe.canPlayType('video/mp4; codecs="hvc1"') !== "";

  return hdrDisplay && supportsHevc ? MEDIA.stagHeroHdr : MEDIA.stagHeroSdr;
}
