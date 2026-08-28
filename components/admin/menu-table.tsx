"use client";

import { useTransition } from "react";
import { toggleSoldOut } from "@/app/admin/(dashboard)/actions";
import type { MenuItemWithAvailability } from "@/lib/db/menu";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function MenuTable({ items }: { items: MenuItemWithAvailability[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-surface-2">
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Drink</th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Mood</th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Price</th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Stock</th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Sold out</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const unavailable = item.isSoldOut || item.outOfStock;
            return (
              <tr key={item.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className={`text-sm font-bold text-ink ${unavailable ? "line-through decoration-1" : ""}`}>
                    {item.name}
                  </p>
                  <p className="font-body text-sm text-ink-2">{item.description}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs uppercase tracking-[0.08em] text-ink-3">
                  {item.moodTag}
                </td>
                <td className="px-4 py-3 font-mono text-sm tabular-nums text-ink">
                  {formatPrice(item.priceCents)}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {item.outOfStock ? (
                    <span className="text-accent-text">no {item.missingIngredient?.toLowerCase()}</span>
                  ) : (
                    <span className="text-ok">in stock</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.isSoldOut}
                    aria-label={item.isSoldOut ? `Mark ${item.name} available` : `Mark ${item.name} sold out`}
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() => {
                        toggleSoldOut(item.id, !item.isSoldOut);
                      })
                    }
                    className={`rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors duration-base disabled:cursor-not-allowed disabled:opacity-50 ${
                      item.isSoldOut
                        ? "bg-accent text-on-accent"
                        : "border border-line-strong text-ink-3 hover:text-ink-2"
                    }`}
                  >
                    {item.isSoldOut ? "Sold out" : "Available"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
