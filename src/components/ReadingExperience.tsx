import { ExternalLink } from "lucide-react";

interface ReadingExperienceProps {
  canReturnToCinema?: boolean;
  onReturnToCinema?: () => void;
}

const MEMORIES = [
  {
    src: "/media/childhood/2008-3-1 021.jpg",
    alt: "An older adult cradles an infant.",
    caption: "Held close · family archive · 2008",
  },
  {
    src: "/media/childhood/20101224141.jpg",
    alt: "A child looks toward the camera in a playroom with a snack in his mouth.",
    caption: "A mouthful · family archive · 2010",
  },
  {
    src: "/media/childhood/2018-07-25 210344.jpg",
    alt: "Three children and an adult make faces for a family photograph at the water's edge.",
    caption: "Blue tongues · family archive · 2018",
  },
  {
    src: "/media/childhood/IMAG0653-topaz-denoise-enhance-3x-faceai.jpg",
    alt: "Two children share a meal at a restaurant table.",
    caption: "Between bites · family archive",
  },
  {
    src: "/media/childhood/IMG_0361.jpg",
    alt: "A child in a red winter coat watches a sparkler catch light.",
    caption: "First sparkler · family archive",
  },
  {
    src: "/media/childhood/照片 002 (2).jpg",
    alt: "A child brushes his teeth at a bathroom sink.",
    caption: "Morning ritual · family archive",
  },
];

const VISUAL_STUDIES = [
  { src: "/media/desk/ribs-freeze.jpg", alt: "A blue-lit stage seen through a rib-like opening.", title: "Stage in Blue" },
  { src: "/media/gallery/overture-precise.jpg", alt: "A translucent lavender stag turns toward the camera.", title: "Overture" },
  { src: "/media/gallery/arrival.jpg", alt: "The Immigration and Customs hall at Toronto Pearson airport.", title: "Arrival" },
  { src: "/media/gallery/guide.jpg", alt: "A luminous stag runs through darkness.", title: "The Guide" },
  { src: "/media/gallery/curtain.jpg", alt: "A luminous stag waits at the edge of a dark stage.", title: "Curtain" },
];

/**
 * The same story in a quiet, linear form. It is the primary experience for
 * compact viewports, browser zoom, and people who request reduced motion.
 */
export function ReadingExperience({ canReturnToCinema = false, onReturnToCinema }: ReadingExperienceProps) {
  return (
    <main id="reading-version" className="reading-experience">
      <header className="reading-hero">
        <img
          src="/media/gallery/overture-precise.jpg"
          alt="A translucent lavender stag in a dark, cinematic landscape."
          className="reading-hero__image"
        />
        <div className="reading-hero__shade" aria-hidden="true" />
        <div className="reading-hero__content">
          <p className="reading-kicker">Ethan Gan · a story in eight acts</p>
          <h1 id="reading-title" tabIndex={-1}>The things that stayed with me.</h1>
          <p className="reading-deck">
            A film about memory, migration, and the effort to understand what we see.
          </p>
          <div className="reading-hero__actions">
            <a className="reading-cue" href="#the-opening">Read the story</a>
            {canReturnToCinema && onReturnToCinema ? (
              <button type="button" className="reading-cinema-return" onClick={onReturnToCinema}>Return to the film</button>
            ) : null}
          </div>
        </div>
      </header>

      <section id="the-opening" className="reading-chapter reading-chapter--narrow">
        <p className="reading-act">Act I · Overture</p>
        <h2>Before I could remember</h2>
        <p className="reading-lead">
          My dad loves photographing our family. His pictures became my memory of years I was too young to remember.
        </p>
        <p className="reading-aside">And then, my childhood ended.</p>
      </section>

      <section className="reading-chat" aria-labelledby="question-heading">
        <div className="reading-chat__phone" lang="zh-CN">
          <p className="reading-chat__group">八年六班</p>
          <p className="reading-chat__incoming">你为什么要去加拿大?</p>
          <p className="reading-chat__outgoing">因为中国人已经三十年没有拿诺贝尔物理奖了。</p>
        </div>
        <div className="reading-chat__copy">
          <p className="reading-act">Act II · The question</p>
          <h2 id="question-heading">“Why are you going to Canada?”</h2>
          <p>
            “Because a Chinese person hasn’t won the Nobel Prize in Physics in thirty years.” It was the answer of a younger self: earnest, oversized, and already looking outward.
          </p>
        </div>
      </section>

      <section className="reading-arrival" aria-labelledby="arrival-heading">
        <img
          src="/media/gallery/arrival.jpg"
          alt="The Immigration and Customs hall at Toronto Pearson airport."
        />
        <div className="reading-arrival__copy">
          <p className="reading-act">Act III · Arrival</p>
          <h2 id="arrival-heading">A new frame</h2>
          <p>The airport became a threshold: one life receding behind the glass, another beginning beyond it.</p>
        </div>
      </section>

      <section className="reading-chapter reading-chapter--wide" aria-labelledby="memory-heading">
        <div className="reading-section-heading">
          <p className="reading-act">Acts IV–V · Life here / blue memoirs</p>
          <h2 id="memory-heading">The family archive</h2>
          <p>As far back as I can remember, these fragments have made up my life.</p>
        </div>
        <div className="reading-memory-grid">
          {MEMORIES.map((memory, index) => (
            <figure key={memory.src} className={`reading-polaroid reading-polaroid--${index % 3}`}>
              <img src={memory.src} alt={memory.alt} loading="lazy" />
              <figcaption>{memory.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="reading-chapter reading-chapter--wide" aria-labelledby="images-heading">
        <div className="reading-section-heading">
          <p className="reading-act">Act VI · Photography</p>
          <h2 id="images-heading">Learning to look</h2>
          <p>Stills from the film.</p>
        </div>
        <div className="reading-studies">
          {VISUAL_STUDIES.map((work) => (
            <figure key={work.title}>
              <img src={work.src} alt={work.alt} loading="lazy" />
              <figcaption>{work.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="reading-research" aria-labelledby="research-heading">
        <div className="reading-research__intro">
          <p className="reading-act">Act VII · The research</p>
          <h2 id="research-heading">How does the brain decide what feels special?</h2>
          <p>
            The images raised a question: how do we see the world — and why does some of it feel beautiful, difficult, or worth remembering?
          </p>
        </div>
        <article className="reading-research__study">
          <div>
            <p className="reading-meta">Research 01 · manuscript in preparation</p>
            <h3>Is disagreement about beauty real, or a shadow cast by the ruler?</h3>
            <p>
              Across 900 beauty-rated images, raw disagreement is highly reproducible. Once the pull of the average rating is removed, however, the signal becomes fragile.
            </p>
          </div>
          <img
            src="/media/research/fig4_qualification_summary.png"
            alt="Research figure summarizing which disagreement metrics qualify as reliable."
            loading="lazy"
          />
        </article>
        <article className="reading-research__study reading-research__study--reverse">
          <div>
            <p className="reading-meta">Research 02 · analysis under way</p>
            <h3>If a machine struggles to say what a picture is, do we find it more beautiful?</h3>
            <p>
              A vision-language model’s uncertainty becomes a per-image ambiguity score, testing whether the effort of interpretation shapes the pleasure of looking.
            </p>
          </div>
          <ol className="reading-ambiguity" aria-label="How the ambiguity score is produced">
            <li><span>01</span>image</li>
            <li><span>02</span>caption</li>
            <li><span>03</span>hesitation</li>
            <li><span>04</span>ambiguity</li>
          </ol>
        </article>
      </section>

      <footer className="reading-curtain">
        <img src="/media/gallery/curtain.jpg" alt="A luminous stag waiting at the edge of a dark stage." />
        <div className="reading-curtain__copy">
          <p className="reading-act">Act VIII · Curtain</p>
          <h2>So, yeah—this is me. Ethan Gan.</h2>
          <p className="reading-curtain__thanks">thanks for watching.</p>
          <div className="reading-actions">
            <a href="https://github.com/theridgerugby" target="_blank" rel="noreferrer" aria-label="GitHub (opens in a new tab)">GitHub <ExternalLink size={16} strokeWidth={1.7} aria-hidden="true" /></a>
            <a href="mailto:ethan.gan@mail.utoronto.ca" aria-label="Email Ethan Gan at ethan.gan@mail.utoronto.ca">Email</a>
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                document.getElementById("reading-title")?.focus({ preventScroll: true });
              }}
            >
              Replay
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
