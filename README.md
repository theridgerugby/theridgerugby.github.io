# Ethan Gan — The things that stayed with me

A scroll-driven autobiographical film about memory, migration, image-making, and perception.

The site has two expressions of the same eight-act story:

- **Cinematic mode** for desktop viewports: scroll-scrubbed film, theatre lighting, Liquid Glass interface pieces, and a persistent stag guide.
- **Reading mode** for compact viewports, browser zoom, and `prefers-reduced-motion`: a linear, image-led version with the same narrative and no video payload.

## Run locally

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
npm run preview
```

Node `^20.19.0` or `>=22.12.0` is required by the current Oxlint toolchain.

## Structure

- `src/scenes/` — the eight cinematic acts.
- `src/components/ReadingExperience.tsx` — the quiet, responsive story.
- `src/components/Glass.tsx` — passive and semantic Liquid Glass primitives.
- `src/components/AccessibleDialog.tsx` — focus-managed lightboxes used by memory, photography, and research scenes.
- `src/lib/timeline.ts` — the global scroll timeline.
- `public/media/` — film, family archive, research figures, gallery stills, and posters.
- `DESIGN.md` — the visual source of truth.
- `PRODUCT.md` — product intent and experience rules.
- `QA_NOTES.md` — the latest verification record.

## Media note

The desktop film intentionally preserves the supplied high-resolution scrub footage. Posters and metadata preloading reduce first-frame fragility; compact and reduced-motion visitors receive the still-image reading experience instead.
