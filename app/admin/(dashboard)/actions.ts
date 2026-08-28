"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/db/client";

/**
 * Toggles the manual is_sold_out flag on a menu item. Revalidates both the
 * admin page (so the toggle reflects immediately) and the public homepage
 * (so a reviewer watching the public tab sees the item grey out without a
 * manual refresh) — the App Router caching trap CLAUDE.md calls out:
 * without this, the public menu is statically cached and won't notice the
 * change until the next natural revalidation.
 */
export async function toggleSoldOut(menuItemId: string, nextValue: boolean) {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("menu_items")
    .update({ is_sold_out: nextValue })
    .eq("id", menuItemId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/");
}
