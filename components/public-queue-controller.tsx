"use client";

import { useEffect, useState, useTransition } from "react";
import { Play, Square } from "lucide-react";
import { PickupBoard } from "@/components/admin/pickup-board";
import { ActivityFeed, type FeedEntry } from "@/components/admin/activity-feed";
import { markPickedUp } from "@/app/(site)/queue/actions";
import type { QueueOrder } from "@/lib/db/orders";

const TICK_INTERVAL_MS = 4000;
const MAX_FEED_ENTRIES = 4;

/**
 * The public counterpart to admin's SimulationController
 * (components/admin/simulation-controller.tsx) — same on/off toggle and
 * polling shape, but calls /api/queue/tick instead of /api/simulation/tick.
 * That endpoint only ever advances an order already in the queue; it never
 * creates one, which is what makes it safe to leave unauthenticated. A
 * visitor can watch (and help move along) real orders without the admin
 * password, but can't fabricate order volume — the only orders that ever
 * appear here are ones a real order-ahead checkout or the admin's own
 * simulation mode actually created.
 *
 * PickupBoard and ActivityFeed are imported from components/admin/ even
 * though this page isn't admin-gated — both are already framework-agnostic
 * (no admin-only dependency), so this reuses them directly rather than
 * duplicating or relocating files for a naming-convention purity that
 * would touch working admin code for no functional reason.
 */
export function PublicQueueController({ initialOrders }: { initialOrders: QueueOrder[] }) {
  const [running, setRunning] = useState(false);
  const [orders, setOrders] = useState(initialOrders);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [, startTransition] = useTransition();

  async function refreshOrders() {
    try {
      const res = await fetch("/api/queue/tick");
      if (!res.ok) return;
      const data: { orders: QueueOrder[] } = await res.json();
      setOrders(data.orders);
    } catch {
      // Best-effort refresh; the next tick (if running) or a manual reload
      // will catch up.
    }
  }

  function handlePickedUp(orderId: string) {
    startTransition(async () => {
      await markPickedUp(orderId);
      await refreshOrders();
    });
  }

  useEffect(() => {
    if (!running) return;

    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/queue/tick", { method: "POST" });
        if (!res.ok || cancelled) return;
        const data: { advanced: { nextStatus: string } | null; orders: QueueOrder[] } =
          await res.json();
        if (cancelled) return;

        setOrders(data.orders);
        if (data.advanced) {
          setFeed((prev) =>
            [
              {
                id: crypto.randomUUID(),
                tone: "advanced" as const,
                text: `An order moved to ${data.advanced!.nextStatus}.`,
              },
              ...prev,
            ].slice(0, MAX_FEED_ENTRIES),
          );
        }
      } catch {
        // A dropped tick just means the next interval tries again.
      }
    }

    const id = setInterval(tick, TICK_INTERVAL_MS);
    tick();

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [running]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface p-4">
        <div className="flex flex-col gap-0.5">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Run the queue</p>
          <p className="font-body text-sm text-ink-2">
            This is a demo — flip this on and orders already waiting will move
            themselves along every few seconds, so you can watch the whole
            lifecycle without needing the admin side.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRunning((prev) => !prev)}
          className={`flex flex-none items-center gap-1.5 rounded-md px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-base ${
            running
              ? "border border-line-strong text-ink-2 hover:text-ink"
              : "bg-accent text-on-accent hover:opacity-90"
          }`}
        >
          {running ? <Square size={13} /> : <Play size={13} />}
          {running ? "Stop" : "Start"}
        </button>
      </div>
      <PickupBoard orders={orders} onPickedUp={handlePickedUp} />
      <ActivityFeed entries={feed} />
    </div>
  );
}
