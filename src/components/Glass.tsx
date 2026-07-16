import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  MouseEvent,
  ReactNode,
} from "react";
import { useRef } from "react";

/**
 * Liquid Glass material system (DESIGN.md §1).
 * - `GlassFilterDefs` mounts the shared SVG refraction lens ONCE (in App).
 * - `GlassSurface` is the material wrapper: refraction (unless `frost`),
 *   lit rim, wet shine, cursor-tracked specular + spectral fringe.
 * Budget: ≤2 refractive surfaces on screen — pass `frost` for the rest.
 * Never use inside 3D transforms (use `.glass-rim` overlays there instead).
 */

export function GlassFilterDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <filter id="lg-refract" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.013" numOctaves="2" seed="7" result="n" />
        <feGaussianBlur in="n" stdDeviation="1.4" result="sn" />
        <feDisplacementMap in="SourceGraphic" in2="sn" scale="10" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

interface GlassSurfaceProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  frost?: boolean; // skip refraction (cheap variant / large panels)
  hover?: boolean; // enable hover physics (lift + specular + fringe bloom)
}

function setPointerPosition(element: HTMLElement, clientX: number, clientY: number) {
  const bounds = element.getBoundingClientRect();
  element.style.setProperty("--gx", `${((clientX - bounds.left) / bounds.width) * 100}%`);
  element.style.setProperty("--gy", `${((clientY - bounds.top) / bounds.height) * 100}%`);
}

function GlassLayers({ children, interactive = false }: { children: ReactNode; interactive?: boolean }) {
  return (
    <>
      <span className="glass__spec" aria-hidden="true" />
      <span className="glass__fringe" aria-hidden="true" />
      {interactive ? (
        <span className="glass-action__content relative z-10">{children}</span>
      ) : (
        <div className="relative z-10">{children}</div>
      )}
    </>
  );
}

export function GlassSurface({ children, className = "", style, frost = false, hover = false }: GlassSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    setPointerPosition(el, e.clientX, e.clientY);
  };

  return (
    <div
      ref={ref}
      onMouseMove={hover ? onMove : undefined}
      className={`glass ${frost ? "glass--frost" : ""} ${hover ? "glass--hover" : ""} ${className}`}
      style={style}
    >
      <GlassLayers>{children}</GlassLayers>
    </div>
  );
}

interface GlassButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  frost?: boolean;
  hover?: boolean;
}

/** Semantic button rendered in the same Liquid Glass material as passive chrome. */
export function GlassButton({
  children,
  className = "",
  frost = false,
  hover = true,
  type = "button",
  ...props
}: GlassButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      type={type}
      className={`glass glass-action ${frost ? "glass--frost" : ""} ${hover ? "glass--hover" : ""} ${className}`}
      onMouseMove={hover ? (event) => setPointerPosition(event.currentTarget, event.clientX, event.clientY) : undefined}
      {...props}
    >
      <GlassLayers interactive>{children}</GlassLayers>
    </button>
  );
}

interface GlassLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  children: ReactNode;
  frost?: boolean;
  hover?: boolean;
}

/** Semantic link rendered in the same Liquid Glass material as passive chrome. */
export function GlassLink({
  children,
  className = "",
  frost = false,
  hover = true,
  ...props
}: GlassLinkProps) {
  return (
    <a
      className={`glass glass-action ${frost ? "glass--frost" : ""} ${hover ? "glass--hover" : ""} ${className}`}
      onMouseMove={hover ? (event) => setPointerPosition(event.currentTarget, event.clientX, event.clientY) : undefined}
      {...props}
    >
      <GlassLayers interactive>{children}</GlassLayers>
    </a>
  );
}
