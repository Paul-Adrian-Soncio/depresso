"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/db/client";

/**
 * The public queue's "Picked up" button — deliberately narrower than
 * admin's advanceOrder: only ever moves an order from "ready" to
 * "completed", never any other transition, and only ever that one order.
 * A visitor can clear a finished order off the board without the admin
 * password, but can't skip an order past brewing or cancel someone else's.
 */
export async function markPickedUp(orderId: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "completed" })
    .eq("id", orderId)
    .eq("status", "ready");

  if (error) throw error;

  revalidatePath("/queue");
  revalidatePath("/admin/orders");
}
