/**
 * Starting stock for every ingredient the menu's recipes reference. Oat
 * milk is deliberately seeded under its own low-stock threshold, so the
 * "sold out — no oat milk" state (already drawn into
 * docs/reference/homepage-dusk.html) is true on arrival rather than staged
 * later through the admin.
 */

export interface SeedIngredient {
  name: string;
  unit: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

export const SEED_INGREDIENTS: SeedIngredient[] = [
  { name: "Espresso beans", unit: "g", stockQuantity: 4000, lowStockThreshold: 500 },
  { name: "Whole milk", unit: "ml", stockQuantity: 8000, lowStockThreshold: 1000 },
  { name: "Oat milk", unit: "ml", stockQuantity: 150, lowStockThreshold: 500 },
  { name: "Cold brew concentrate", unit: "ml", stockQuantity: 5000, lowStockThreshold: 500 },
  { name: "Chocolate syrup", unit: "ml", stockQuantity: 1500, lowStockThreshold: 200 },
  { name: "Cinnamon", unit: "g", stockQuantity: 300, lowStockThreshold: 50 },
  { name: "White energy drink", unit: "ml", stockQuantity: 3000, lowStockThreshold: 500 },
  { name: "Chamomile tea bag", unit: "bag", stockQuantity: 120, lowStockThreshold: 20 },
];
