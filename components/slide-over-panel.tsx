"use client";

import { useEffect, useState } from "react";

/**
 * Shared shell for CartDrawer and MobileNav — both used to conditionally
 * render `{open && <div>...}`, which mounts/unmounts the whole overlay
 * instantly with no transition. This keeps the panel mounted for the
 * duration of the close animation instead: `open` controls the *target*
 * state, `visible` is a one-frame-delayed copy that actually drives the
 * CSS classes, so the panel mounts off-screen first and then transitions
 * in on the next frame (an instant class-and-mount would just apply the
 * end state immediately, same problem as before) — and on close, the
 * panel keeps rendering with the "closed" transform/opacity until the
 * transition's own duration elapses, instead of vanishing on the same
 * frame the close button is clicked.
 *
 * Respects prefers-reduced-motion for free: the transition-duration
 * classes here are overridden to near-zero by the global rule in
 * globals.css, so the timeout below still fires (just almost
 * immediately) and nothing needs a separate reduced-motion branch.
 */
export function SlideOverPanel({
  open,
  onClose,
  children,
  className = "",
  panelClassName = "",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Extra classes on the fixed-position root (e.g. `lg:hidden` for a
   * trigger that only exists below a breakpoint, so a stray open panel
   * can't get stuck visible if the viewport is resized past it). */
  className?: string;
  panelClassName?: string;
}) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // Mount immediately (off-screen, via the `visible` classes below).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRendered(true);

      // A single requestAnimationFrame here isn't reliable — it can still
      // fire before the browser has actually painted the "closed" starting
      // position, so the transition has nothing to animate from and the
      // panel just appears already open. Nesting two rAF calls guarantees
      // the closed state gets painted first: the outer one runs at the
      // start of the very next frame (after this mount's paint), and only
      // the inner one — the start of the frame *after that* — flips to
      // open, so there's a real painted frame in between for the CSS
      // transition to animate from.
      let inner: number;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    setVisible(false);
    const timeout = setTimeout(() => setRendered(false), 320);
    return () => clearTimeout(timeout);
  }, [open]);

  if (!rendered) return null;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end ${className}`}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-320 ease-quiet ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative flex h-full w-full max-w-sm flex-col gap-6 overflow-y-auto border-l border-line bg-ground p-6 transition-transform duration-320 ease-quiet ${
          visible ? "translate-x-0" : "translate-x-full"
        } ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
