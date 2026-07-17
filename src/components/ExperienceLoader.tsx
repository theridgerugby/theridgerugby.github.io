import { AnimatePresence, motion } from "framer-motion";
import { POSTERS } from "../lib/media";

interface ExperienceLoaderProps {
  visible: boolean;
  progress: number;
  timedOut: boolean;
}

export function ExperienceLoader({
  visible,
  progress,
  timedOut,
}: ExperienceLoaderProps) {
  const percentage = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="experience-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          aria-label={timedOut ? "Opening the film with available media" : "Preparing the film"}
          data-qa-experience-loader={timedOut ? "fallback" : "loading"}
        >
          <img
            src={POSTERS.opening}
            alt=""
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />
          <div className="experience-loader__shade" />
          <div className="experience-loader__status">
            <span>{timedOut ? "Opening with available frames" : "Preparing the first scene"}</span>
            <div
              className="experience-loader__track"
              role="progressbar"
              aria-label="Loading the first scene"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentage}
            >
              <motion.div
                className="experience-loader__fill"
                animate={{ scaleX: progress }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <output>{percentage.toString().padStart(2, "0")}</output>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
