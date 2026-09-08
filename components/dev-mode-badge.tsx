"use client";

import { useDevModeContext } from "@/components/dev-mode-provider";

/**
 * Persistent while dev mode is on, mirroring the "admit it's a demo" badge
 * in the footer — makes it unmistakable this is an instrumentation view,
 * not a real UI state.
 *
 * Doubles as the off switch below `sm`, where DevModeTrigger is hidden
 * (its hover/focus tooltips have no touch equivalent) — without this, dev
 * mode turned on at a wider width, then resized down, would have no way
 * to turn back off.
 */
export function DevModeBadge() {
  const { enabled, toggle } = useDevModeContext();

  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Turn off dev mode"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 rounded-full border border-cool bg-[#14100A] px-3 py-1.5 shadow-lg transition-opacity duration-base hover:opacity-80"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-cool" />
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#D9E1E6]">
        Dev mode
      </span>
    </button>
  );
}
