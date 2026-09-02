"use client";

import { createContext, useContext } from "react";
import { useCart } from "@/components/use-cart";
import type { Cart, CartLine } from "@/lib/domain/cart";

interface CartContextValue {
  cart: Cart;
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * One cart, shared between the menu grid (add-to-cart) and the header cart
 * indicator/drawer — same context-wrapping-a-hook shape as PeriodProvider,
 * since both the add and the read side live in different parts of the page.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const value = useCart();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
