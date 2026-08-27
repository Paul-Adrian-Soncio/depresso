"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Period } from "@/lib/domain/period";

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
