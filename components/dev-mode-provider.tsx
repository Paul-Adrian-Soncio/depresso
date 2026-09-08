"use client";

import { createContext, useContext } from "react";
import { useDevMode } from "@/components/use-dev-mode";

interface DevModeContextValue {
  enabled: boolean;
  toggle: () => void;
}

const DevModeContext = createContext<DevModeContextValue | null>(null);

/**
 * Same context-wrapping-a-hook shape as CartProvider/PeriodProvider — the
 * toggle (footer) and the annotations scattered across the page are
 * unrelated parts of the tree, so both need to read/write the same state.
 */
export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const value = useDevMode();
  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>;
}

export function useDevModeContext() {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error("useDevModeContext must be used within a DevModeProvider");
  }
  return context;
}
