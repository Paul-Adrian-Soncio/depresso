/**
 * Starting stock for every ingredient the menu's recipes reference. Oat
 * milk is deliberately seeded under its own low-stock threshold, so the
 * "sold out — no oat milk" state (already drawn into
 * docs/reference/homepage-dusk.html) is true on arrival rather than staged
 * later through the admin.
 *
 * containerSize is display/restock convenience only (see the
 * 20260904002505 migration) — how many units of `unit` come in one
 * container as actually purchased (a 1000ml milk carton, a 750ml syrup
 * bottle). Never read by deduct_stock_for_order; stock_quantity in the
 * ingredient's own unit is still the only number that function ever sees.
 * Left undefined where a container concept above the base unit doesn't
 * apply (a tea bag already is the unit).
 */

export interface SeedIngredient {
  name: string;
  unit: string;
  stockQuantity: number;
  lowStockThreshold: number;
  containerSize?: number;
}

export const SEED_INGREDIENTS: SeedIngredient[] = [
  { name: "Espresso beans", unit: "g", stockQuantity: 4000, lowStockThreshold: 500, containerSize: 1000 },
  { name: "Whole milk", unit: "ml", stockQuantity: 8000, lowStockThreshold: 1000, containerSize: 1000 },
  { name: "Oat milk", unit: "ml", stockQuantity: 150, lowStockThreshold: 500, containerSize: 1000 },
  { name: "Cold brew concentrate", unit: "ml", stockQuantity: 5000, lowStockThreshold: 500, containerSize: 1000 },
  { name: "Chocolate syrup", unit: "ml", stockQuantity: 1500, lowStockThreshold: 200, containerSize: 750 },
  { name: "Cinnamon", unit: "g", stockQuantity: 300, lowStockThreshold: 50, containerSize: 300 },
  { name: "White energy drink", unit: "ml", stockQuantity: 3000, lowStockThreshold: 500, containerSize: 250 },
  { name: "Chamomile tea bag", unit: "bag", stockQuantity: 120, lowStockThreshold: 20 },
];
