"use client";

import { Mascot } from "@/components/mascot";
import type { QueueOrder } from "@/lib/db/orders";

/**
 * The counter-facing half of the split view: no controls by default, just
 * what a customer glancing at a pickup screen would see — what's still
 * being made, what's ready to grab. Received and brewing collapse into one
 * "In progress" column (a waiting customer doesn't care which sub-stage an
 * order is at); Ready is its own column since that's the one state that
 * actually matters to them. Reads the same `orders` list OrderQueue does,
 * so marking an order complete on the admin side removes it from
 * getActiveOrders() and it disappears from both sides on the next refresh
 * — no separate "erase" logic needed here. The header mirrors a real
 * above-the-counter screen rather than another admin panel.
 *
 * `onPickedUp` is optional: admin's SimulationController doesn't pass it
 * (that page's own OrderQueue table already has a Complete button), but
 * the public /queue page does, since it has no other way to clear a
 * finished order without the admin password — see app/(site)/queue/actions.ts.
 */
export function PickupBoard({
  orders,
  onPickedUp,
}: {
  orders: QueueOrder[];
  onPickedUp?: (orderId: string) => void;
}) {
  const inProgress = orders.filter((o) => o.status === "received" || o.status === "brewing");
  const ready = orders.filter((o) => o.status === "ready");

  return (
    <div className="flex flex-col gap-4 rounded-md border border-line bg-surface p-4">
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <Mascot className="h-8 w-auto" />
        <span className="font-display text-base font-bold tracking-[-0.02em] text-ink">
          Depresso
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
          · Pickup
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <BoardColumn title="In progress" orders={inProgress} tone="progress" />
        <BoardColumn title="Ready for pickup" orders={ready} tone="ready" onPickedUp={onPickedUp} />
      </div>
    </div>
  );
}

function BoardColumn({
  title,
  orders,
  tone,
  onPickedUp,
}: {
  title: string;
  orders: QueueOrder[];
  tone: "progress" | "ready";
  onPickedUp?: (orderId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
        {title} <span className="tabular-nums">({orders.length})</span>
      </p>
      {orders.length === 0 ? (
        <p className="font-body text-sm text-ink-3">Nothing here right now.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`animate-row-in flex flex-col gap-2 rounded-md border p-3 ${
                tone === "ready" ? "border-ok/40 bg-ground" : "border-line-strong bg-ground"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">{order.customerName}</span>
                {tone === "ready" && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ok">
                    Ready
                  </span>
                )}
              </div>
              <p className="font-body text-sm text-ink-2">
                {order.items.map((item) => `${item.quantity}× ${item.menuItemName}`).join(", ")}
              </p>
              {tone === "ready" && onPickedUp && (
                <button
                  type="button"
                  onClick={() => onPickedUp(order.id)}
                  className="flex w-fit items-center gap-1.5 rounded-sm border border-line-strong px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2 transition-colors duration-base hover:border-ok hover:text-ok"
                >
                  Picked up
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
