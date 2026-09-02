"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Minus, Plus, X } from "lucide-react";
import { useCartContext } from "@/components/cart-provider";
import { cartItemCount, cartTotalCents } from "@/lib/domain/cart";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Self-contained: owns its own open/closed state and reads the shared cart
 * context, so it can drop into the header without page.tsx needing to know
 * anything about cart internals. The drawer overlays rather than navigating
 * — checkout is the only place that's an actual route (/checkout), since a
 * cart review doesn't need a shareable URL the way an order confirmation
 * does.
 */
export function CartDrawer() {
  const { cart, setQuantity, removeItem } = useCartContext();
  const [open, setOpen] = useState(false);
  const count = cartItemCount(cart);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
        className="relative flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2"
      >
        <ShoppingBag size={13} />
        Cart
        {count > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] font-bold tabular-nums text-on-accent">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="relative flex h-full w-full max-w-sm flex-col gap-6 overflow-y-auto border-l border-line bg-ground p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-[-0.02em] text-ink">Your cart</h2>
              <button
                type="button"
                aria-label="Close cart"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-3 transition-colors duration-base hover:text-ink-2"
              >
                <X size={16} />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="font-body text-sm text-ink-2">
                Nothing here yet — add a drink from the menu.
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {cart.map((line) => (
                    <div key={line.menuItemId} className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-ink">{line.menuItemName}</p>
                        <p className="font-mono text-xs text-ink-3">
                          {formatPrice(line.priceCents)} each
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            aria-label={`Decrease ${line.menuItemName} quantity`}
                            onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-line-strong text-ink-2 transition-colors duration-base hover:text-ink"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-4 text-center font-mono text-xs tabular-nums text-ink">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${line.menuItemName} quantity`}
                            onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-line-strong text-ink-2 transition-colors duration-base hover:text-ink"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-mono text-sm tabular-nums text-ink">
                          {formatPrice(line.priceCents * line.quantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(line.menuItemId)}
                          className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-accent-text"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 border-t border-line pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
                      Total
                    </span>
                    <span className="font-mono text-lg tabular-nums text-ink">
                      {formatPrice(cartTotalCents(cart))}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-md bg-accent px-4 py-3 font-display text-sm font-bold text-on-accent transition-colors duration-base hover:opacity-90"
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
