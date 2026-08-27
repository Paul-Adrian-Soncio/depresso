"use client";

import { useEffect } from "react";
import { periodFromDate } from "@/lib/domain/period";

/**
 * Resolves the visitor's real local time into the `depresso-period` cookie
 * on first load, then applies it to <html data-period> immediately so the
 * server's placeholder period doesn't linger. Never overwrites a cookie that
 * already exists — that would clobber a manual override from the header
 * switcher or an auto-detection from earlier in the session.
 */
export function PeriodSync({ hasCookie }: { hasCookie: boolean }) {
  useEffect(() => {
    if (hasCookie) return;

    const period = periodFromDate(new Date());
    document.documentElement.dataset.period = period;

    fetch("/api/period", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, manual: false }),
    }).catch(() => {});
  }, [hasCookie]);

  return null;
}
