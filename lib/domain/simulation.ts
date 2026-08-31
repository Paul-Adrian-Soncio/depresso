import type { MenuItemWithAvailability } from "@/lib/db/menu";
import type { NewOrderLine } from "@/lib/db/orders";

/**
 * Same first-name list used by the seed script (supabase/seed-data/customers.ts)
 * — kept as a separate copy rather than imported because that file lives
 * under supabase/seed-data and is a generation-time script input, not
 * something meant to be pulled into the running app's bundle.
 */
const SIMULATED_CUSTOMER_NAMES = [
  "Alex", "Sam", "Jordan", "Casey", "Morgan", "Riley", "Taylor", "Jamie",
  "Avery", "Quinn", "Reese", "Skyler", "Drew", "Hayden", "Rowan", "Finley",
  "Emerson", "Blake", "Charlie", "Dakota", "Elliot", "Frankie", "Harper",
  "Kai", "Lane", "Marlowe", "Nico", "Oakley", "Parker", "Remy", "Sage",
  "Toni", "Wren", "Alexis", "Bryn",
];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * A menu item is fair game for a simulated order under the exact same rule
 * the public site uses to grey it out: not manually sold out, and not
 * short an ingredient. Simulation should never be able to "order" something
 * a real visitor couldn't.
 */
function availableItems(menu: MenuItemWithAvailability[]): MenuItemWithAvailability[] {
  return menu.filter((item) => !item.isSoldOut && !item.outOfStock);
}

export interface SimulatedOrderPlan {
  customerName: string;
  lines: NewOrderLine[];
}

/**
 * Builds one order's worth of lines from whatever's actually orderable right
 * now — one to two line items, same quantity range as the seed generator
 * (supabase/seed-data/generate.ts), so a simulated order looks like the
 * seeded ones rather than standing out as synthetic. Returns null if
 * nothing on the menu is currently orderable (everything sold out or
 * stocked-out) — simulation should skip a tick rather than force an order
 * through.
 */
export function planSimulatedOrder(menu: MenuItemWithAvailability[]): SimulatedOrderPlan | null {
  const candidates = availableItems(menu);
  if (candidates.length === 0) return null;

  const lineItemCount = Math.min(candidates.length, Math.random() < 0.7 ? 1 : 2);
  const chosen = new Map<string, MenuItemWithAvailability>();
  while (chosen.size < lineItemCount) {
    const item = pick(candidates);
    chosen.set(item.id, item);
  }

  const lines: NewOrderLine[] = [...chosen.values()].map((item) => ({
    menuItemId: item.id,
    menuItemName: item.name,
    quantity: Math.random() < 0.8 ? 1 : 2,
    unitPriceCents: item.priceCents,
  }));

  return { customerName: pick(SIMULATED_CUSTOMER_NAMES), lines };
}
