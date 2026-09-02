"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Cart, CartLine } from "@/lib/domain/cart";

const STORAGE_KEY = "depresso-cart";

function loadStoredCart(): Cart {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is CartLine =>
        typeof line?.menuItemId === "string" &&
        typeof line?.menuItemName === "string" &&
        typeof line?.priceCents === "number" &&
        typeof line?.quantity === "number" &&
        line.quantity > 0,
    );
  } catch {
    return [];
  }
}

/**
 * Persisted in localStorage, same pattern as the ambient mixer's mix and
 * the player's volume — starts empty (server/client must match on first
 * paint) and is corrected to the stored cart after mount.
 */
export function useCart() {
  const [cart, setCart] = useState<Cart>([]);
  const skipWriteRef = useRef(true);

  useEffect(() => {
    const stored = loadStoredCart();
    // Correcting the SSR-safe empty default to the real stored cart after
    // mount — same hydration-mismatch fix as useAmbience/usePlayer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(stored);
  }, []);

  useEffect(() => {
    if (skipWriteRef.current) {
      skipWriteRef.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((item: Omit<CartLine, "quantity">, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((line) =>
          line.menuItemId === item.menuItemId
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.menuItemId !== menuItemId);
      return prev.map((line) => (line.menuItemId === menuItemId ? { ...line, quantity } : line));
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setCart((prev) => prev.filter((line) => line.menuItemId !== menuItemId));
  }, []);

  const clear = useCallback(() => {
    setCart([]);
  }, []);

  return { cart, addItem, setQuantity, removeItem, clear };
}
