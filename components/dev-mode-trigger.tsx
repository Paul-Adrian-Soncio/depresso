"use client";

import { Code2 } from "lucide-react";
import { useDevModeContext } from "@/components/dev-mode-provider";

/**
 * Placed in the footer next to PersistentPlayer rather than the header nav,
 * which is already crowded — a small, easy-to-miss-if-you're-not-looking
 * toggle rather than a headline feature.
 *
 * Hidden below `sm`: DevAnnotation's whole interaction model is a
 * hover/focus tooltip, which has no equivalent on a touch screen — showing
 * the trigger there would just be a dead end, not a smaller version of the
 * feature.
 */
export function DevModeTrigger() {
  const { enabled, toggle } = useDevModeContext();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn off dev mode" : "Turn on dev mode"}
      title="Dev mode — see what's powering this page"
      className={`hidden h-8 w-8 flex-none items-center justify-center rounded-full border transition-colors duration-base sm:flex ${
        enabled
          ? "border-accent bg-accent text-on-accent"
          : "border-line-strong text-ink-3 hover:text-ink-2"
      }`}
    >
      <Code2 size={14} />
    </button>
  );
}
