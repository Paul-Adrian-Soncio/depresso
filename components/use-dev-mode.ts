"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "depresso-dev-mode";

/**
 * Persisted in localStorage, same hydration-safe pattern as useCart/
 * useAmbience: starts false (server/client must match on first paint) and
 * is corrected to the stored value after mount.
 */
export function useDevMode() {
  const [enabled, setEnabled] = useState(false);
  const skipWriteRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (skipWriteRef.current) {
      skipWriteRef.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return { enabled, toggle };
}
