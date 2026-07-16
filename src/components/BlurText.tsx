import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface BlurTextProps {
  text: string;
  className?: string;
  /** If provided (0..1), reveal is driven by this progress value instead of IntersectionObserver. */
  progress?: number;
  /** Font/style override applied to each word span's wrapper. */
  as?: "span" | "div" | "h1" | "h2" | "p";
  delayMs?: number;
}

/**
 * BlurText — split by word; each word animates filter: blur(10px)->blur(0),
 * opacity 0->1, y 50->0, 0.7s, 100ms stagger.
 * Triggered either by IntersectionObserver (threshold 0.1) or by an external
 * scroll-progress value (0..1) for scenes that are already scroll-bound.
 */
export function BlurText({
  text,
  className,
  progress,
  as = "span",
  delayMs = 0,
}: BlurTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(progress !== undefined);
  const words = text.split(" ");

  useEffect(() => {
    if (progress !== undefined) return; // externally driven
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [progress]);

  const Wrapper = as;

  return (
    <Wrapper ref={ref as never} className={className}>
      {words.map((word, i) => {
        let wordProgress: number;
        if (progress !== undefined) {
          // Distribute reveal across words based on external progress.
          const stagger = 1 / (words.length + 2);
          const start = i * stagger;
          wordProgress = Math.min(1, Math.max(0, (progress - start) / stagger));
        } else {
          wordProgress = inView ? 1 : 0;
        }

        return (
          <motion.span
            key={i}
            style={{ display: "inline-block", whiteSpace: "pre" }}
            initial={false}
            animate={{
              opacity: wordProgress,
              y: 50 - 50 * wordProgress,
              filter: `blur(${10 - 10 * wordProgress}px)`,
            }}
            transition={{
              duration: progress !== undefined ? 0 : 0.7,
              delay: progress !== undefined ? 0 : (delayMs + i * 100) / 1000,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        );
      })}
    </Wrapper>
  );
}
