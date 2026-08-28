"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/db/client";

/**
 * Sets an ingredient's stock to an exact quantity — for correcting a count,
 * not for a delivery (see adjustStock for that). Revalidates the public
 * homepage too: stock is what derives a menu item's out-of-stock state
 * (lib/db/menu.ts), so a change here can flip a drink's availability on
 * the live site immediately, same caching trap as the sold-out toggle.
 */
export async function setStock(ingredientId: string, quantity: number) {
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new Error("Stock quantity must be a non-negative number");
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("ingredients")
    .update({ stock_quantity: quantity })
    .eq("id", ingredientId);

  if (error) throw error;

  revalidatePath("/admin/stock");
  revalidatePath("/admin");
  revalidatePath("/");
}

/**
 * Adds (or subtracts, with a negative delta) to the current stock — models
 * "a delivery arrived" without the admin needing to know or re-type the
 * current count.
 */
export async function adjustStock(ingredientId: string, delta: number) {
  if (!Number.isFinite(delta)) {
    throw new Error("Adjustment must be a number");
  }

  const supabase = createServiceRoleClient();

  const { data: current, error: readError } = await supabase
    .from("ingredients")
    .select("stock_quantity")
    .eq("id", ingredientId)
    .single();

  if (readError) throw readError;

  const nextQuantity = Math.max(0, current.stock_quantity + delta);

  const { error: writeError } = await supabase
    .from("ingredients")
    .update({ stock_quantity: nextQuantity })
    .eq("id", ingredientId);

  if (writeError) throw writeError;

  revalidatePath("/admin/stock");
  revalidatePath("/admin");
  revalidatePath("/");
}
