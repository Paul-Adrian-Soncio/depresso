"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { QueueOrder } from "@/lib/db/orders";

const STAGES: { status: QueueOrder["status"]; label: string }[] = [
  { status: "received", label: "Received" },
  { status: "brewing", label: "Brewing" },
  { status: "ready", label: "Ready" },
];

const STAGE_INDEX: Record<QueueOrder["status"], number> = {
  received: 0,
  brewing: 1,
  ready: 2,
  completed: 3,
  cancelled: -1,
};

const POLL_INTERVAL_MS = 2500;

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Polls app/api/order/[id] rather than using Supabase Realtime — this page
 * has no auth, and the order table has no public RLS policy, so a direct
 * client subscription isn't an option without exposing order data broadly.
 * Polling through the existing server-only lookup keeps the same
 * server-owns-data-access rule the rest of the app follows. Stops polling
 * once the order reaches a terminal state (completed/cancelled) — nothing
 * left to watch for at that point.
 */
export function OrderStatus({ initialOrder }: { initialOrder: QueueOrder }) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    if (order.status === "completed" || order.status === "cancelled") return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/order/${order.id}`);
        if (!res.ok || cancelled) return;
        const data: { order: QueueOrder } = await res.json();
        if (!cancelled) setOrder(data.order);
      } catch {
        // A dropped poll just means the next interval tries again.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [order.id, order.status]);

  const currentIndex = STAGE_INDEX[order.status];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-text">
          Order for {order.customerName}
        </p>
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-ink">
          {order.status === "cancelled" ? "Order cancelled" : "Hang tight."}
        </h1>
      </div>

      {order.status === "cancelled" ? (
        <p className="rounded-md border border-line bg-surface p-4 font-body text-sm text-ink-2">
          Something in this order ran out of stock right as it was placed —
          it never made it to the queue, and nothing was charged.
        </p>
      ) : (
        <div className="flex items-center gap-2">
          {STAGES.map((stage, i) => {
            const reached = currentIndex >= i;
            const isLast = i === STAGES.length - 1;
            return (
              <div key={stage.status} className="flex flex-1 items-center gap-2">
                <div className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-base ${
                      reached
                        ? "border-accent bg-accent text-on-accent"
                        : "border-line-strong bg-surface text-ink-3"
                    }`}
                  >
                    {currentIndex > i ? <Check size={16} /> : <span className="font-mono text-xs">{i + 1}</span>}
                  </div>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.1em] ${
                      reached ? "text-ink" : "text-ink-3"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`h-0.5 flex-1 rounded-full transition-colors duration-base ${
                      currentIndex > i ? "bg-accent" : "bg-line-strong"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4">
        {order.items.map((item, i) => (
          <p key={i} className="font-body text-sm text-ink-2">
            {item.quantity}× {item.menuItemName}
          </p>
        ))}
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Total</span>
          <span className="font-mono text-sm tabular-nums text-ink">
            {formatPrice(order.totalCents)}
          </span>
        </div>
      </div>
    </div>
  );
}
