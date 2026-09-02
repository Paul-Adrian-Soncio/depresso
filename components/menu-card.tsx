"use client";

import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCartContext } from "@/components/cart-provider";
import { MenuCardShell } from "@/components/menu-card-shell";
import type { MenuItemWithAvailability } from "@/lib/db/menu";

export function MenuCard({ item }: { item: MenuItemWithAvailability }) {
  const { addItem } = useCartContext();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem({ menuItemId: item.id, menuItemName: item.name, priceCents: item.priceCents });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
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
  );
}
