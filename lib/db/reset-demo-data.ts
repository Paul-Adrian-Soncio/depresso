import "server-only";
import { randomUUID } from "node:crypto";
import { createServiceRoleClient } from "@/lib/db/client";
import { SEED_INGREDIENTS } from "@/supabase/seed-data/ingredients";
import { SEED_MENU } from "@/supabase/seed-data/menu";
import { SEED_CUSTOMER_NAMES } from "@/supabase/seed-data/customers";
import { generateOrderHistory } from "@/lib/domain/seed-generation";

// Supabase's client has no "delete everything" call — PostgREST requires a
// filter on DELETE, so `neq` against a value no real row will ever match is
// the standard way to express "all rows" without a raw SQL escape hatch.
const MATCH_ALL = "00000000-0000-0000-0000-000000000000";

// Batched rather than one row per request: ~1500 orders and ~3000 order
// items inserted individually would be thousands of round trips. Supabase's
// client accepts an array per insert() call, so this chunks into a handful
// of requests instead.
const INSERT_BATCH_SIZE = 500;

async function batchInsert<T extends object>(
  table: string,
  supabase: ReturnType<typeof createServiceRoleClient>,
  rows: T[],
) {
  for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
    const batch = rows.slice(i, i + INSERT_BATCH_SIZE);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table name is dynamic across ingredients/menu_items/orders/etc, which the generated Database type can't express generically
    const { error } = await (supabase.from as any)(table).insert(batch);
    if (error) throw error;
  }
}

/**
 * Restores the database to the same shape `supabase db reset` would produce
 * — same ingredients, same menu, a freshly generated ~90 days of order
 * history — without needing the Supabase CLI or Docker, which a deployed
 * server action doesn't have access to. Uses the same generateOrderHistory
 * algorithm supabase/seed-data/generate.ts uses to build seed.sql, just
 * seeded from the current time instead of a fixed number, so every reset
 * produces a plausible-but-different history rather than replaying the
 * exact same 1500 orders verbatim.
 *
 * This is a demo-only control (see the "hidden reset page" decision in
 * docs/DECISIONS.md) — it affects the one shared database everyone using
 * the live site reads from, there is no per-visitor isolation.
 */
export async function resetDemoData(): Promise<{ orders: number; orderItems: number }> {
  const supabase = createServiceRoleClient();

  // Children before parents: order_items -> orders, recipe_items ->
  // menu_items/ingredients, then the parent tables themselves. recipe_items
  // has no `id` column (its primary key is the composite
  // menu_item_id/ingredient_id), so it needs its own filter rather than
  // reusing the `neq("id", ...)` "delete everything" trick the id-keyed
  // tables use.
  const idKeyedDeletes = [
    supabase.from("order_items").delete().neq("id", MATCH_ALL),
    supabase.from("orders").delete().neq("id", MATCH_ALL),
  ];
  for (const query of idKeyedDeletes) {
    const { error } = await query;
    if (error) throw error;
  }

  const { error: recipeItemsError } = await supabase
    .from("recipe_items")
    .delete()
    .neq("menu_item_id", MATCH_ALL);
  if (recipeItemsError) throw recipeItemsError;

  const remainingIdKeyedDeletes = [
    supabase.from("menu_items").delete().neq("id", MATCH_ALL),
    supabase.from("ingredients").delete().neq("id", MATCH_ALL),
  ];
  for (const query of remainingIdKeyedDeletes) {
    const { error } = await query;
    if (error) throw error;
  }

  const ingredientIds = new Map<string, string>();
  const ingredientRows = SEED_INGREDIENTS.map((ing) => {
    const id = randomUUID();
    ingredientIds.set(ing.name, id);
    return {
      id,
      name: ing.name,
      unit: ing.unit,
      stock_quantity: ing.stockQuantity,
      low_stock_threshold: ing.lowStockThreshold,
    };
  });
  await batchInsert("ingredients", supabase, ingredientRows);

  const menuItemIds = new Map<string, string>();
  const menuItemRows = SEED_MENU.map((item, index) => {
    const id = randomUUID();
    menuItemIds.set(item.name, id);
    return {
      id,
      name: item.name,
      description: item.description,
      mood_tag: item.moodTag,
      price_cents: item.priceCents,
      is_sold_out: false,
      sold_out_reason: null,
      display_order: index,
    };
  });
  await batchInsert("menu_items", supabase, menuItemRows);

  const recipeItemRows = SEED_MENU.flatMap((item) =>
    item.recipe.map((ingredient) => ({
      menu_item_id: menuItemIds.get(item.name)!,
      ingredient_id: ingredientIds.get(ingredient.ingredientName)!,
      quantity_required: ingredient.quantityRequired,
    })),
  );
  await batchInsert("recipe_items", supabase, recipeItemRows);

  const menuEntries = SEED_MENU.map((item) => ({
    id: menuItemIds.get(item.name)!,
    priceCents: item.priceCents,
  }));
  const generatedOrders = generateOrderHistory({
    seed: Date.now(),
    menu: menuEntries,
    customerNames: SEED_CUSTOMER_NAMES,
  });

  const orderRows = generatedOrders.map((order) => ({
    id: randomUUID(),
    customer_name: order.customerName,
    status: order.status,
    total_cents: order.totalCents,
    created_at: order.createdAt.toISOString(),
  }));
  await batchInsert("orders", supabase, orderRows);

  const orderItemRows = generatedOrders.flatMap((order, index) =>
    order.lines.map((line) => ({
      id: randomUUID(),
      order_id: orderRows[index].id,
      menu_item_id: line.menuItemId,
      quantity: line.quantity,
      unit_price_cents: line.unitPriceCents,
    })),
  );
  await batchInsert("order_items", supabase, orderItemRows);

  return { orders: orderRows.length, orderItems: orderItemRows.length };
}
