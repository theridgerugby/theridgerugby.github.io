import { useState } from "react";
import { motion } from "framer-motion";
import { AccessibleDialog } from "../components/AccessibleDialog";
import { GlassSurface } from "../components/Glass";
import { Spotlight } from "../components/Spotlight";
import { remap } from "../lib/timeline";

const EXPO = [0.16, 1, 0.3, 1] as const;

interface S6Props {
  localP: number; // 0..1 within S6
}

/**
 * S6 · The Research — the manifesto poses the question; two museum vitrines
 * (Liquid Glass panels under spotlights) hold the two attempts at answering it.
 * Sensitivity rules (agents' audit): solo-author framing; no reviewer/venue
 * strategy; no third-party literature figures; no BOLD5000/ImageNet stimulus
 * images — only Ethan's own figures and our own concept diagram.
 */
export function S6Research({ localP }: S6Props) {
  const [exhibit, setExhibit] = useState<{ src: string; alt: string; title: string } | null>(null);

  // beats
  const manifesto = remap(localP, 0.03, 0.1) * (1 - remap(localP, 0.16, 0.22));
  const aT = remap(localP, 0.2, 0.26) * (1 - remap(localP, 0.5, 0.55));
  const bT = remap(localP, 0.55, 0.61) * (1 - remap(localP, 0.9, 0.96));

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* ── Manifesto intertitle ── */}
      <div className="absolute inset-0 flex items-center justify-center px-16 pointer-events-none" style={{ opacity: manifesto }}>
        <p className="font-heading italic font-light text-white text-5xl tracking-[0.015em] leading-snug text-center max-w-[30ch]">
          and now, I want to understand how the human brain perceives the world — and why some of it feels special.
        </p>
      </div>

      {/* ── Vitrine A — the ruler: is disagreement about beauty real? ── */}
      <div className="absolute inset-0" aria-hidden={aT <= 0.5} inert={aT <= 0.5} style={{ opacity: aT, pointerEvents: aT > 0.5 ? "auto" : "none" }}>
        <Spotlight x="50%" y="40%" size="62vw" tint="rgba(200,190,235,0.14)" dust={8} opacity={aT} />
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translateY(${(1 - aT) * 3}vh)` }}>
          <GlassSurface frost className="research-panel rounded-[22px] px-10 py-8" style={{ width: "min(72vw, 820px)" }}>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/65">
              research 01 · manuscript in preparation
            </p>
            <h2
              id="research-01-title"
              tabIndex={-1}
              className="font-heading italic font-light text-white text-[1.9rem] leading-snug mt-4 max-w-[30ch] outline-none"
            >
              When a crowd splits over how beautiful an image is — is the split real, or a shadow cast by the ruler?
            </h2>
            <p className="font-body text-white/80 text-[15px] leading-relaxed mt-4 max-w-[68ch]">
              People rarely agree on what is beautiful. My first paper asks a deceptively simple
              question: when an image “divides opinion”, is that a stable property of the image —
              or an artifact of how rating scales work? Comparing several ways of measuring
              disagreement across 900 beauty-rated images, and stress-testing the decision rule in
              simulation, I found raw disagreement highly reproducible — yet once the pull of the
              average rating is removed, the signal turns fragile.
            </p>
            {/* exhibits — Ethan's own figures, click to enlarge */}
            <div className="flex gap-4 mt-6">
              {[
                { src: "/media/research/fig1_data_and_ladder.png", cap: "The estimand ladder", alt: "Research figure showing the progression from ratings to disagreement estimands." },
                { src: "/media/research/fig4_qualification_summary.png", cap: "The verdict", alt: "Research figure summarizing which disagreement metrics qualify as reliable." },
              ].map((f) => (
                <button
                  key={f.src}
                  type="button"
                  aria-label={`Enlarge ${f.cap}`}
                  className="research-figure relative w-[18vw] max-w-[250px] rounded-[10px] overflow-hidden cursor-zoom-in bg-white border-0 p-0"
                  onClick={() => setExhibit({ src: f.src, alt: f.alt, title: f.cap })}
                >
                  <img src={f.src} alt="" className="w-full h-auto" draggable={false} />
                  <div className="glass-rim rounded-[10px]" />
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] text-white/60 mt-5">
              dataset: OASIS-Beauty (Brielmann &amp; Pelli, 2019) · 900 images · 757 raters
            </p>
          </GlassSurface>
        </div>
      </div>

      {/* ── Vitrine B — the machine: metabolic aesthetics ── */}
      <div className="absolute inset-0" aria-hidden={bT <= 0.5} inert={bT <= 0.5} style={{ opacity: bT, pointerEvents: bT > 0.5 ? "auto" : "none" }}>
        <Spotlight x="50%" y="40%" size="62vw" tint="rgba(160,195,235,0.14)" dust={8} opacity={bT} />
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translateY(${(1 - bT) * 3}vh)` }}>
          <GlassSurface frost className="research-panel rounded-[22px] px-10 py-8" style={{ width: "min(72vw, 820px)" }}>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/65">
              research 02 · metabolic aesthetics · pipeline built, analysis under way
            </p>
            <h2 className="font-heading italic font-light text-white text-[1.9rem] leading-snug mt-4 max-w-[30ch]">
              If a machine struggles to say what a picture is, do we find it more beautiful?
            </h2>
            <p className="font-body text-white/80 text-[15px] leading-relaxed mt-4 max-w-[68ch]">
              I let a vision-language model caption five thousand images and read off its own
              uncertainty as a per-image “ambiguity” score. The question underneath: does the
              effort of interpreting a picture shape the pleasure of looking at it? The
              measurement pipeline is built and validated; lining machine ambiguity up against
              human ratings of pleasure and complexity is the step under way.
            </p>
            <div className="mt-6 rounded-[12px] px-6 py-5" style={{ background: "rgba(255,255,255,0.04)" }}>
              <ConceptFlow />
            </div>
            <p className="font-mono text-[10px] text-white/60 mt-5">
              stimuli: BOLD5000 · model: BLIP-2 · human ratings: pleasure &amp; complexity
            </p>
          </GlassSurface>
        </div>
      </div>

      {exhibit ? (
        <AccessibleDialog
          title={exhibit.title}
          onClose={() => setExhibit(null)}
          className="accessible-dialog--cool"
          panelClassName="research-dialog"
        >
            <motion.div
              className="bg-white rounded-[14px] p-5"
              style={{ width: "min(72vw, 1180px)", boxShadow: "0 44px 110px rgba(0,0,0,0.6)" }}
              initial={{ scale: 0.82, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EXPO }}
            >
              <img src={exhibit.src} alt={exhibit.alt} className="w-full h-auto" draggable={false} />
            </motion.div>
        </AccessibleDialog>
      ) : null}
    </div>
  );
}

function ConceptFlow() {
  const steps = [
    ["01", "Image", "one visual stimulus"],
    ["02", "Caption", "the model's words"],
    ["03", "Hesitation", "token uncertainty"],
    ["04", "Ambiguity", "a score from 0 to 1"],
  ];

  return (
    <ol className="concept-flow" aria-label="How the ambiguity score is produced">
      {steps.map(([number, title, description]) => (
        <li key={number}>
          <span>{number}</span>
          <strong>{title}</strong>
          <small>{description}</small>
        </li>
      ))}
    </ol>
  );
}
