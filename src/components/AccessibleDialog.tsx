import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface AccessibleDialogProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
  className?: string;
  panelClassName?: string;
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * A small, reusable dialog primitive for the three cinematic lightboxes.
 * It owns focus, Escape, background dismissal, and body scroll locking so the
 * visual treatment can remain scene-specific without losing native behavior.
 */
export function AccessibleDialog({
  children,
  onClose,
  title,
  className = "",
  panelClassName = "",
}: AccessibleDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = requestAnimationFrame(() => closeRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActive?.focus();
    };
  }, []);

  return createPortal(
    <div
      className={`accessible-dialog ${className}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`accessible-dialog__panel ${panelClassName}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        <button ref={closeRef} type="button" className="dialog-close" onClick={onClose}>
          <X size={18} strokeWidth={1.7} aria-hidden="true" />
          <span className="sr-only">Close {title}</span>
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
