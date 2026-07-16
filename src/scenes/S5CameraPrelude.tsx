import { BlurText } from "../components/BlurText";
import { remap } from "../lib/timeline";

interface S5CameraPreludeProps {
  localP: number;
}

export function S5CameraPrelude({ localP }: S5CameraPreludeProps) {
  const reveal = remap(localP, 0.08, 0.58);
  const depart = remap(localP, 0.72, 0.96);

  return (
    <section className="absolute inset-0 overflow-hidden bg-black" aria-label="A new chapter in photographs">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          opacity: 0.32 * (1 - depart),
          background:
            "radial-gradient(44% 40% at 50% 48%, rgba(181,191,225,0.16) 0%, rgba(70,78,108,0.05) 46%, rgba(0,0,0,0) 76%)",
        }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center px-[10vw]"
        style={{
          opacity: 1 - depart,
          transform: `translateY(${-depart * 2.5}vh)`,
        }}
      >
        <BlurText
          as="h2"
          text="I picked up my dad's old camera and captured these new memories"
          progress={reveal}
          className="max-w-[27ch] text-center font-heading text-[clamp(2.2rem,4vw,4.2rem)] font-light italic leading-[1.16] tracking-[0.01em] text-white"
        />
      </div>
    </section>
  );
}
