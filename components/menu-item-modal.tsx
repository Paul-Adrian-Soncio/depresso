"use client";

import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { useCartContext } from "@/components/cart-provider";
import type { MenuItemWithAvailability } from "@/lib/db/menu";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Opened by clicking the card body (see MenuCard) rather than the small
 * add-to-cart button, which stays a direct one-click add so quick ordering
 * from the grid still works without forcing a detour through the modal.
 */
export function MenuItemModal({
  item,
  onClose,
}: {
  item: MenuItemWithAvailability;
  onClose: () => void;
}) {
  const { addItem } = useCartContext();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem({ menuItemId: item.id, menuItemName: item.name, priceCents: item.priceCents });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="relative flex w-full max-w-md flex-col gap-5 rounded-md border border-line bg-ground p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {item.moodTag && (
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-text">
                {item.moodTag}
              </p>
            )}
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">{item.name}</h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-ink-3 transition-colors duration-base hover:text-ink-2"
          >
            <X size={16} />
          </button>
        </div>

        <p className="font-body text-base leading-relaxed text-ink-2">{item.description}</p>

        {item.ingredients.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Ingredients</p>
            <div className="flex flex-wrap gap-2">
              {item.ingredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="rounded-full border border-line-strong bg-surface px-3 py-1 font-mono text-xs text-ink-2"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
          <span className="font-mono text-lg tabular-nums text-ink">
            {formatPrice(item.priceCents)}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 font-display text-sm font-bold text-on-accent transition-colors duration-base ${
              justAdded ? "bg-ok" : "bg-accent hover:opacity-90"
            }`}
          >
            {justAdded ? <Check size={15} /> : <Plus size={15} />}
            {justAdded ? "Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
