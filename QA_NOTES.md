# QA Notes — Holistic experience review

**Date:** 2026-07-10; follow-up interaction/type pass 2026-07-11; delivery audit 2026-07-17

**Target:** production build served locally at `http://127.0.0.1:4173/`

**Evidence:** `artifacts/design-audit/baseline/` and `artifacts/design-audit/final/`

## Audit scope

The site was reviewed as a complete experience rather than a collection of screens: narrative clarity, design-system fidelity, content trust, keyboard and assistive behavior, reduced motion, mobile/zoom adaptation, short-laptop layout, media loading, and final conversion.

The audit was grounded in `PRODUCT.md`, `DESIGN.md`, the existing implementation, the authored media, and the prior project philosophy preserved in Claude's project memory.

## Baseline findings

The opening, theatre frame, stag, WeChat scene, scroll-scrub mechanics, and research tone were already distinctive. The most damaging breaks were:

- a visible `TODO: Canada life reel` inside the film;
- nine colored placeholder photographs and six placeholder gallery works with invented metadata;
- a desktop-only rejection screen below 1024px;
- no complete reduced-motion experience;
- pointer-only `div` interactions, no dialog semantics, no Escape, and no focus restoration;
- invisible scene content remaining available to assistive technology;
- a 15px horizontal scrollbar caused by `100vw`;
- research panels clipping at 1024×600;
- low-contrast microcopy and no meaningful final action;
- MP4 metadata at the end of the Pearson and stag files, delaying stream startup.

## Repair pass

### Content and narrative

- Replaced the Canada-life placeholder with a real 2018 family-archive photograph in the existing projector treatment.
- Replaced all nine desk placeholders with real family photographs and truthful archive/year labels.
- Replaced all gallery placeholders with real stills from the film: Stage in Blue, Overture, Arrival, The Guide, and Curtain.
- Tightened the opening, memoir, and curtain copy without changing the autobiographical arc.
- Added GitHub, Email, and Replay at the curtain; no CV action is shown because no publishable CV exists in the repository.

### Access and input

- Added a complete reading experience for compact viewports and `prefers-reduced-motion`.
- Verified desktop reduced-motion mode mounts **zero video elements**.
- Replaced every clickable `div` in S4–S6 with native buttons.
- Added a shared portal dialog with an accessible name, visible close control, focus trap, Escape dismissal, body scroll lock, and focus restoration.
- Added a keyboard-only route from the film to the reading experience.
- Added `lang="zh-CN"` to the WeChat screen, a semantic English translation in cinematic mode, and a visible translation in reading mode.
- Inactive scene layers and research vitrines are hidden from pointer interaction and assistive technology.

### Layout and visual polish

- Removed horizontal overflow and visually hidden browser scrollbars while preserving scrolling.
- Widened and compacted research panels for short laptop heights.
- Raised metadata contrast and refined the type hierarchy to self-hosted Spectral Light italic / Hanken Grotesk, with JetBrains Mono / Noto Sans SC retained where appropriate.
- Kept the no-navigation, theatre-and-glass philosophy intact.
- Added a real stag crop as the favicon and completed page metadata.

### Media

- Compressed the nine public childhood JPEGs to **1.51 MiB total** while retaining the full-resolution originals under `refs/childhood/`.
- Added five truthful gallery/poster stills at **0.41 MiB total**.
- Added a real first-scene readiness gate: decoded poster, local display fonts, video metadata, first frame, and roughly 2.5 seconds of contiguous A1 buffer. It fails open after 12 seconds and keeps the timeline inert through the exit fade.
- Added staged media preparation: A2/B before the S0 handoff, Pearson during S1, ribs during S3, and exactly one capability-selected A3 source during S6. Immediate Skip promotes A3 and holds black for its first frame or a 2.8-second watchdog.
- Re-encoded A1 at 1080p H.264 with a 0.2-second closed GOP; re-encoded Pearson at 1080p H.264 with a 0.4-second closed GOP. Both are fast-start and measured near VMAF 96 against 1080p-scaled masters.
- Re-encoded run and idle to 720p H.264 for their 12vh display footprint, reducing the pair from 19.48 MiB to 0.79 MiB while retaining their still-image fallbacks.
- A3 keeps its original 4K Main10 PQ/BT.2020 HEVC path for HDR-capable playback and the existing 1080p BT.709 Hable tone-mapped fallback for SDR. Playback now chooses one source, retries SDR after HDR failure, and has a stall watchdog.
- Current `public/` payload is **82.28 MiB** (**72.84 MiB video**), and only the opening scene is critical; later assets are prepared in narrative order.

## Browser verification matrix

| Mode | Viewport / setting | Result |
|---|---:|---|
| Cinematic desktop | 1440×900 | PASS — no overflow; opening, memory desk, gallery, research, curtain reviewed |
| Short laptop | 1024×600 | PASS — all research content fits; dialogs fit; no overflow |
| Reading tablet | 768×1024 | PASS — editorial two-column moments remain composed |
| Reading mobile | 390×844 | PASS — full story, readable type, single-column archive, no overflow |
| Reduced motion desktop | 1440×900 + `reduce` | PASS — full reading experience; zero videos mounted |
| Chrome delivery pass | 1708×1024, normal network | PASS — A1 scrub, A2/B 2-second stop-and-resume, black-covered Skip, SDR A3 and finale controls verified |
| Chrome constrained network | 3G + cache disabled | PASS — cinematic loading curtain remained visible over the decoded 1080p poster and the 12-second post-mount fail-open prevented an indefinite lock |

Representative final screenshots:

- `final/01-opening-1440x900.png`
- `final/03-memory-desk-1440x900.png`
- `final/10-gallery-dialog-1024x600.png`
- `final/11-research-01-1024x600.png`
- `final/13-reading-mobile-hero.png`
- `final/20-reading-reduced-motion-desktop.png`

## Interaction checks

- Scroll cue is a real button and advances the film.
- Memory photograph opens by button; close control receives focus; Escape closes; focus returns to the originating photograph.
- Only the centered S5 card is focusable and exposed; its dialog image flips with a real `aria-pressed` button.
- Research figures open in the same accessible dialog model.
- GitHub is a real external link; Email opens a `mailto:` composer; Replay returns to the opening.
- A2 runs while scroll input is active; after 2000 ms of quiet, B plays once to settle the stag; new input interrupts B and returns immediately to A2.
- A3 is independent of scroll after activation. Visible-Chrome QA confirmed playback advanced while the scroll position remained exactly unchanged; leaving the finale reset it to `0 s`, and re-entry started it again.
- Grain and stage overlays remain `pointer-events: none`.

## Build gates

- `npm run lint` — PASS (`src` scope, zero warnings).
- `npm run build` — PASS (`tsc -b` + Vite production build).
- Live font probes — PASS: Spectral italic 300 and Hanken Grotesk are both loaded from the self-hosted WOFF2 files rather than fallback faces.
- `npm audit` — 0 vulnerabilities at the time of this review.
- Source scan — zero `TODO`, `placeholder`, or `Untitled` markers in `src/`; all primary S4–S6 actions use native buttons.
- Delivery path scan — zero references to the retired `world.mp4`, `pearson.mp4`, `stag-run.mp4`, or `stag-idle.mp4` filenames in source, public HTML, or product documentation.
- Media metadata audit — PASS: opening poster 1920×1080; A1/Pearson 1920×1080 H.264 BT.709; A2/B 1280×720 H.264 BT.709; A3 HDR 3840×2160 Main10 PQ/BT.2020; A3 SDR 1920×1080 H.264 BT.709.

## Intentional boundaries / pre-publish check

- The high-resolution desktop film remains a substantial download by explicit design choice.
- No soundtrack or audible playback is present; source containers with audio tracks are always muted.
- There is no automated visual-regression suite; this pass used matched live-browser screenshots plus DOM, focus, viewport, and media-query probes.
- Family photographs are genuine. Confirm consent/privacy with the people shown before public deployment.
