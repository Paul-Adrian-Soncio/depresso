"use client";

import { useEffect } from "react";

/**
 * The admin section is always dusk-themed, independent of the public
 * site's live time-of-day system (see docs/DECISIONS.md). The public
 * site's PeriodProvider mutates <html data-period> directly via
 * document.documentElement, and that mutation survives a client-side
 * navigation into /admin — the root layout's server-rendered
 * data-period="dusk" only applies on a full page load, not a soft nav, so
 * without this, arriving at /admin by clicking a link (rather than
 * reloading) leaves <html> stuck on whatever period the visitor was on.
 * This is the same imperative-mutation pattern PeriodProvider itself uses,
 * just forcing one fixed value instead of a live one.
 */
export function ForceDusk() {
  useEffect(() => {
    document.documentElement.dataset.period = "dusk";
  }, []);

  return null;
}
