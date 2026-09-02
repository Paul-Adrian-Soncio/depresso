"use client";

import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCartContext } from "@/components/cart-provider";
import { MenuCardShell } from "@/components/menu-card-shell";
import { MenuItemModal } from "@/components/menu-item-modal";
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
      <div
        role="button"
        tabIndex={0}
        onClick={() => !unavailable && setModalOpen(true)}
        onKeyDown={(event) => {
          if (unavailable) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setModalOpen(true);
          }
        }}
        aria-label={`View ${item.name}`}
        className={unavailable ? "" : "cursor-pointer"}
      >
        <MenuCardShell item={item}>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${item.name} to cart`}
            className={`flex h-7 w-7 flex-none items-center justify-center rounded-full transition-colors duration-base ${
              justAdded ? "bg-ok text-on-accent" : "bg-accent text-on-accent hover:opacity-90"
            }`}
          >
            {justAdded ? <Check size={14} /> : <Plus size={14} />}
          </button>
        </MenuCardShell>
      </div>

      {modalOpen && !unavailable && (
        <MenuItemModal item={item} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
