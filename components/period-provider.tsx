"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { isPeriod, type Period } from "@/lib/domain/period";

interface PeriodContextValue {
  period: Period;
  setPeriod: (period: Period) => void;
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

/**
 * Client-side source of truth for the active period, seeded from the
 * server-resolved value. The switcher and PeriodSync both write here so
 * anything rendering period-dependent copy re-renders instantly instead of
 * waiting for a reload — <html data-period> stays the one true source for
 * CSS, this context is the one true source for React state.
 */
export function PeriodProvider({
  initial,
  children,
}: {
  initial: Period;
  children: React.ReactNode;
}) {
  const [period, setPeriodState] = useState<Period>(initial);

  function setPeriod(next: Period) {
    setPeriodState(next);
    document.documentElement.dataset.period = next;
  }

  useEffect(() => {
    // Re-read the cookie directly rather than trusting `period` state or the
    // `initial` prop: Next's router cache can serve a stale RSC payload for
    // this route on browser back-navigation (no server round-trip at all),
    // reusing this component with whatever `initial` value that stale
    // payload was rendered with. Meanwhile /admin's ForceDusk has already
    // overwritten <html data-period> directly. Resolving the cookie
    // ourselves on every mount is the only value guaranteed to be current.
    //
    // But if there's no cookie at all, there's nothing to "correct back to"
    // — and doing so is actively harmful on a true first visit. PeriodSync
    // (a sibling, whose effect runs first since it's the child) detects the
    // real period from the visitor's clock and calls setPeriod
    // synchronously, but its cookie write is an async fetch() that hasn't
    // resolved yet by the time this effect runs. Reading document.cookie
    // here and falling back to `initial` (the SSR default, "dusk") would
    // stomp PeriodSync's freshly-detected value right back to dusk before
    // the visitor ever saw it corrected. No cookie means PeriodSync owns
    // this decision — leave period/DOM exactly as they are.
    const match = document.cookie.match(/(?:^|; )depresso-period=([^;]+)/);
    const cookiePeriod = match?.[1];
    if (!isPeriod(cookiePeriod)) return;

    document.documentElement.dataset.period = cookiePeriod;
    // Correcting possibly-stale router-cache state to the real cookie value,
    // same pattern as the ambient mixer's post-mount localStorage correction.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPeriodState(cookiePeriod);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.period = period;
  }, [period]);

  return (
    <PeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriodContext() {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error("usePeriodContext must be used within a PeriodProvider");
  }
  return context;
}
