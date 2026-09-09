"use client";

import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCartContext } from "@/components/cart-provider";
import { MenuCardShell } from "@/components/menu-card-shell";
import { MenuItemModal } from "@/components/menu-item-modal";
import { DevAnnotation } from "@/components/dev-annotation";
import type { MenuItemWithAvailability } from "@/lib/db/menu";

export function MenuCard({ item }: { item: MenuItemWithAvailability }) {
  const { addItem } = useCartContext();
  const [justAdded, setJustAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const unavailable = item.isSoldOut || item.outOfStock;

  function handleAdd(event: React.MouseEvent) {
    event.stopPropagation();
    addItem({ menuItemId: item.id, menuItemName: item.name, priceCents: item.priceCents });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <>
      <DevAnnotation
        kind="client-component"
        label="getMenu() — lib/db/menu.ts"
        detail="sold_out: item.isSoldOut (stored) OR outOfStock (derived from stock_quantity)"
      >
        <div className="relative h-full">
          {/* A real <button> can't legally contain another interactive
              control (the add-to-cart button below), so instead of a
              role="button" div wrapping both, this sits underneath as an
              invisible full-card hit target. The shell above it gets
              pointer-events-none so its own box doesn't intercept clicks
              meant for this button (a later sibling normally paints and
              hit-tests on top regardless of z-index), and the add-to-cart
              button re-enables pointer-events on itself so it's still
              independently clickable through that hole. */}
          {!unavailable && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label={`View ${item.name}`}
              className="absolute inset-0 z-0 cursor-pointer rounded-[5px]"
            />
          )}
          <div className="pointer-events-none relative h-full">
            <MenuCardShell item={item}>
              <button
                type="button"
                onClick={handleAdd}
                aria-label={`Add ${item.name} to cart`}
                className={`pointer-events-auto flex h-7 w-7 flex-none items-center justify-center rounded-full transition-colors duration-base ${
                  justAdded ? "bg-ok text-on-accent" : "bg-accent text-on-accent hover:opacity-90"
                }`}
              >
                {justAdded ? <Check size={14} /> : <Plus size={14} />}
              </button>
            </MenuCardShell>
          </div>
        </div>
      </DevAnnotation>

      {modalOpen && !unavailable && (
        <MenuItemModal item={item} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
