"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, Check } from "lucide-react";
import { ringUp } from "@/app/admin/(dashboard)/pos/actions";
import { cartItemCount, cartTotalCents, type Cart } from "@/lib/domain/cart";
import type { MenuItemWithAvailability } from "@/lib/db/menu";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function randomTicketNumber(): string {
  return `Order #${Math.floor(Math.random() * 900) + 100}`;
}

type ChargeState = "idle" | "charging" | "done";

/**
 * The dense, fast counterpart to the rest of /admin — deliberately not the
 * lofi site's design language (large serif type, generous spacing). Big
 * tap targets, no scrolling to find a drink, minimal steps from "tap a
 * drink" to "order in the queue". Owns its own ticket state (not the
 * shared cart context /menu uses) — a barista ringing up a counter order
 * has nothing to do with whatever a customer's browser has sitting in
 * their own cart. Charging always succeeds immediately, unlike the
 * customer checkout's simulated decline/retry — see actions.ts.
 */
export function PosTerminal({ menu }: { menu: MenuItemWithAvailability[] }) {
  const [ticket, setTicket] = useState<Cart>([]);
  const [customerName, setCustomerName] = useState("");
  const [chargeState, setChargeState] = useState<ChargeState>("idle");
  const [lastOrder, setLastOrder] = useState<{ label: string; total: number } | null>(null);

  const orderable = menu.filter((item) => !item.isSoldOut && !item.outOfStock);
  const total = cartTotalCents(ticket);
  const count = cartItemCount(ticket);

  function addToTicket(item: MenuItemWithAvailability) {
    setTicket((prev) => {
      const existing = prev.find((line) => line.menuItemId === item.id);
      if (existing) {
        return prev.map((line) =>
          line.menuItemId === item.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [
        ...prev,
        { menuItemId: item.id, menuItemName: item.name, priceCents: item.priceCents, quantity: 1 },
      ];
    });
  }

  function setQuantity(menuItemId: string, quantity: number) {
    setTicket((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.menuItemId !== menuItemId);
      return prev.map((line) => (line.menuItemId === menuItemId ? { ...line, quantity } : line));
    });
  }

  function clearTicket() {
    setTicket([]);
    setCustomerName("");
  }

  async function charge() {
    if (ticket.length === 0 || chargeState === "charging") return;
    setChargeState("charging");

    const label = customerName.trim() || randomTicketNumber();
    const result = await ringUp(
      label,
      ticket.map((line) => ({
        menuItemId: line.menuItemId,
        menuItemName: line.menuItemName,
        quantity: line.quantity,
        unitPriceCents: line.priceCents,
      })),
    );

    setLastOrder({ label: result.cancelled ? `${label} — out of stock` : label, total });
    setChargeState("done");
    clearTicket();
    setTimeout(() => setChargeState("idle"), 1800);
  }

  return (
    <div className="flex h-[calc(100vh-65px)] gap-px overflow-hidden bg-line">
      <div className="grid flex-1 auto-rows-min grid-cols-3 gap-px overflow-y-auto bg-line xl:grid-cols-4">
        {orderable.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => addToTicket(item)}
            className="flex min-h-32 flex-col justify-between gap-2 bg-surface p-4 text-left transition-colors duration-fast hover:bg-surface-2 active:bg-line-strong"
          >
            <span className="font-display text-lg font-bold leading-tight tracking-[-0.01em] text-ink">
              {item.name}
            </span>
            <span className="font-mono text-sm tabular-nums text-ink-3">
              {formatPrice(item.priceCents)}
            </span>
          </button>
        ))}
      </div>

      <div className="flex w-96 flex-none flex-col bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
            Ticket {count > 0 && <span className="tabular-nums">({count})</span>}
          </span>
          {ticket.length > 0 && (
            <button
              type="button"
              onClick={clearTicket}
              aria-label="Clear ticket"
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 transition-colors duration-fast hover:text-accent-text"
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {ticket.length === 0 ? (
            <p className="pt-8 text-center font-mono text-xs text-ink-3">
              Tap a drink to start a ticket.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {ticket.map((line) => (
                <div key={line.menuItemId} className="flex items-center justify-between gap-2">
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-bold text-ink">{line.menuItemName}</span>
                    <span className="font-mono text-xs tabular-nums text-ink-3">
                      {formatPrice(line.priceCents * line.quantity)}
                    </span>
                  </div>
                  <div className="flex flex-none items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`Decrease ${line.menuItemName}`}
                      onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-sm border border-line-strong text-ink-2 transition-colors duration-fast hover:border-accent hover:text-accent-text"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-4 text-center font-mono text-sm tabular-nums text-ink">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${line.menuItemName}`}
                      onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-sm border border-line-strong text-ink-2 transition-colors duration-fast hover:border-accent hover:text-accent-text"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-line px-5 py-4">
          <input
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Name for the ticket (optional)"
            disabled={chargeState === "charging"}
            className="rounded-sm border border-line-strong bg-ground px-3 py-2 font-mono text-sm text-ink outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Total</span>
            <span className="font-mono text-2xl tabular-nums text-ink">{formatPrice(total)}</span>
          </div>
          <button
            type="button"
            onClick={charge}
            disabled={ticket.length === 0 || chargeState === "charging"}
            className={`flex items-center justify-center gap-2 rounded-md px-4 py-4 font-display text-base font-bold text-on-accent transition-colors duration-fast disabled:cursor-not-allowed disabled:opacity-40 ${
              chargeState === "done" ? "bg-ok" : "bg-accent hover:opacity-90"
            }`}
          >
            {chargeState === "done" ? (
              <>
                <Check size={18} />
                Order sent
              </>
            ) : chargeState === "charging" ? (
              "Charging…"
            ) : (
              `Charge ${formatPrice(total)}`
            )}
          </button>
          {lastOrder && chargeState === "idle" && (
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
              Last: {lastOrder.label} · {formatPrice(lastOrder.total)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
