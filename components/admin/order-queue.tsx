"use client";

import { useTransition } from "react";
import { advanceOrder, cancelOrder } from "@/app/admin/(dashboard)/orders/actions";
import type { QueueOrder } from "@/lib/db/orders";

const STATUS_LABEL: Record<QueueOrder["status"], string> = {
  received: "Received",
  brewing: "Brewing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const NEXT_ACTION_LABEL: Partial<Record<QueueOrder["status"], string>> = {
  received: "Start brewing",
  brewing: "Mark ready",
  ready: "Complete",
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function OrderQueue({
  orders,
  onChanged,
}: {
  orders: QueueOrder[];
  onChanged?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  if (orders.length === 0) {
    return (
      <p className="rounded-md border border-line bg-surface p-6 font-mono text-sm text-ink-3">
        No active orders right now.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const actionLabel = NEXT_ACTION_LABEL[order.status];
        return (
          <div
            key={order.id}
            className="animate-row-in flex items-center justify-between gap-4 rounded-md border border-line bg-surface p-4"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-accent-text">
                  {STATUS_LABEL[order.status]}
                </span>
                <span className="text-sm font-bold text-ink">{order.customerName}</span>
                <span className="font-mono text-xs text-ink-3">{formatTime(order.createdAt)}</span>
              </div>
              <p className="font-body text-sm text-ink-2">
                {order.items.map((item) => `${item.quantity}× ${item.menuItemName}`).join(", ")}
              </p>
              <p className="font-mono text-xs tabular-nums text-ink-3">
                {formatPrice(order.totalCents)}
              </p>
            </div>
            <div className="flex flex-none items-center gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await cancelOrder(order.id);
                    onChanged?.();
                  })
                }
                className="rounded-sm border border-line-strong px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              {actionLabel && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await advanceOrder(order.id, order.status);
                      onChanged?.();
                    })
                  }
                  className="rounded-sm bg-accent px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.1em] text-on-accent transition-colors duration-base hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLabel}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
