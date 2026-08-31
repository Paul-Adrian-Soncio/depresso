"use client";

import { useEffect, useState } from "react";
import { Play, Square } from "lucide-react";
import { OrderQueue } from "@/components/admin/order-queue";
import { ActivityFeed, type FeedEntry } from "@/components/admin/activity-feed";
import type { QueueOrder } from "@/lib/db/orders";
import type { SimulationEvent } from "@/app/api/simulation/tick/route";

const TICK_INTERVAL_MS = 4000;
const MAX_FEED_ENTRIES = 4;

function describeEvent(event: SimulationEvent): FeedEntry | null {
  const id = crypto.randomUUID();

  if (event.type === "placed") {
    if (event.cancelled) {
      return {
        id,
        tone: "cancelled",
        text: `${event.customerName}'s order couldn't be fulfilled — out of stock.`,
      };
    }
    return {
      id,
      tone: "placed",
      text: `${event.customerName} ordered ${event.itemNames.join(", ")}.`,
    };
  }

  if (event.type === "advanced") {
    return { id, tone: "advanced", text: `An order moved to ${event.nextStatus}.` };
  }

  return null;
}

/**
 * Owns simulation mode's on/off state and polling loop, and is the single
 * source of truth for the active-orders list once running — OrderQueue
 * renders whatever this passes it instead of only the server-rendered
 * initial props, and ActivityFeed renders a short-lived log of what each
 * tick did. A plain client-side interval rather than a background job or
 * cron: this is a portfolio demo control, not production infrastructure —
 * see the "hand over the keys" / "admit it's a demo" rules in CLAUDE.md.
 * Simulation only runs while this component is mounted (i.e. someone has
 * the orders tab open), which is an honest constraint to state rather than
 * something to hide.
 */
export function SimulationController({ initialOrders }: { initialOrders: QueueOrder[] }) {
  const [running, setRunning] = useState(false);
  const [orders, setOrders] = useState(initialOrders);
  const [feed, setFeed] = useState<FeedEntry[]>([]);

  async function refreshOrders() {
    try {
      const res = await fetch("/api/simulation/tick");
      if (!res.ok) return;
      const data: { orders: QueueOrder[] } = await res.json();
      setOrders(data.orders);
    } catch {
      // Best-effort refresh; the next simulation tick (if running) or a
      // manual page reload will catch up.
    }
  }

  useEffect(() => {
    if (!running) return;

    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/simulation/tick", { method: "POST" });
        if (!res.ok || cancelled) return;
        const data: { event: SimulationEvent; orders: QueueOrder[] } = await res.json();
        if (cancelled) return;

        setOrders(data.orders);
        const entry = describeEvent(data.event);
        if (entry) {
          setFeed((prev) => [entry, ...prev].slice(0, MAX_FEED_ENTRIES));
        }
      } catch {
        // A dropped tick just means the next interval tries again — nothing
        // to surface for a demo control like this.
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
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Simulation mode</p>
          <p className="font-body text-sm text-ink-2">
            Places and advances fake orders every few seconds — real stock deduction, real
            race-condition guard. Runs only while this tab is open.
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
      <OrderQueue orders={orders} onChanged={refreshOrders} />
      <ActivityFeed entries={feed} />
    </div>
  );
}
