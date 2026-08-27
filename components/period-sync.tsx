"use client";

import { useEffect } from "react";
import { periodFromDate } from "@/lib/domain/period";
import { usePeriodContext } from "@/components/period-provider";

/**
 * Resolves the visitor's real local time into the `depresso-period` cookie
 * on first load, then applies it through the shared period context so both
 * CSS (<html data-period>) and period-dependent copy update immediately —
 * the server's placeholder period shouldn't linger either place. Never
 * overwrites a cookie that already exists — that would clobber a manual
 * override from the header switcher or an auto-detection from earlier in
 * the session.
 */
export function PeriodSync({ hasCookie }: { hasCookie: boolean }) {
  const { setPeriod } = usePeriodContext();

  useEffect(() => {
    if (hasCookie) return;

    const period = periodFromDate(new Date());
    setPeriod(period);

    fetch("/api/period", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, manual: false }),
    }).catch(() => {});
    // Runs once per mount to resolve the first-visit period; setPeriod is
    // stable from context and intentionally excluded to avoid re-triggering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCookie]);

  return null;
}
