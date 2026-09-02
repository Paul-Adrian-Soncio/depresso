import "server-only";
import { createServiceRoleClient } from "@/lib/db/client";

export interface MenuItemWithAvailability {
  id: string;
  name: string;
  description: string;
  moodTag: string | null;
  priceCents: number;
  displayOrder: number;
  isSoldOut: boolean;
  soldOutReason: string | null;
  outOfStock: boolean;
  missingIngredient: string | null;
  ingredients: string[];
}

/**
 * The public menu, with availability derived from both the manual
 * is_sold_out toggle and actual ingredient stock — an item is unavailable
 * if either says so. Server-only (never called from the browser), so this
 * uses the service-role client rather than the anon one: ingredients has
 * no public RLS policy (stock numbers aren't meant to be a public API
 * surface), and the anon client's join to it silently returns null rather
 * than erroring, which would make every item read as always-in-stock.
 */
export async function getMenu(): Promise<MenuItemWithAvailability[]> {
  const supabase = createServiceRoleClient();

  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("id, name, description, mood_tag, price_cents, display_order, is_sold_out, sold_out_reason")
    .order("display_order", { ascending: true });

  if (itemsError) throw itemsError;
  if (!items) return [];

  const { data: recipes, error: recipesError } = await supabase
    .from("recipe_items")
    .select("menu_item_id, quantity_required, ingredients (name, stock_quantity)");

  if (recipesError) throw recipesError;

  // First ingredient found short for a given item "wins" as the displayed
  // reason — a drink is very unlikely to be short on two ingredients at
  // once in this seed data, and picking the first is simpler than trying
  // to rank them.
  const missingIngredientByMenuItem = new Map<string, string>();
  const ingredientsByMenuItem = new Map<string, string[]>();
  for (const row of recipes ?? []) {
    const stock = row.ingredients?.stock_quantity ?? 0;
    if (stock < row.quantity_required && !missingIngredientByMenuItem.has(row.menu_item_id)) {
      missingIngredientByMenuItem.set(row.menu_item_id, row.ingredients?.name ?? "an ingredient");
    }
    if (row.ingredients?.name) {
      const list = ingredientsByMenuItem.get(row.menu_item_id) ?? [];
      list.push(row.ingredients.name);
      ingredientsByMenuItem.set(row.menu_item_id, list);
    }
  }

  return items.map((item) => {
    const missingIngredient = missingIngredientByMenuItem.get(item.id) ?? null;
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      moodTag: item.mood_tag,
      priceCents: item.price_cents,
      displayOrder: item.display_order,
      isSoldOut: item.is_sold_out,
      soldOutReason: item.sold_out_reason,
      outOfStock: missingIngredient !== null,
      missingIngredient,
      ingredients: ingredientsByMenuItem.get(item.id) ?? [],
    };
  });
}
