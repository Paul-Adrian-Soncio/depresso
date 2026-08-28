"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/db/client";
import { getNextStatus, type OrderStatus } from "@/lib/db/orders";

// Stock deduction (deduct_stock_for_order, the SELECT ... FOR UPDATE
// race-condition guard) belongs at order-creation time, not here — orders
// are always created already at "received", so there's no transition INTO
// that status for this action to hook into. It gets wired into whichever
// feature actually creates orders (order-ahead flow / simulation mode).

export async function advanceOrder(orderId: string, currentStatus: OrderStatus) {
  const nextStatus = getNextStatus(currentStatus);
  if (!nextStatus) return;

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", orderId);
  if (error) throw error;

  revalidatePath("/admin/orders");
}

export async function cancelOrder(orderId: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
  if (error) throw error;

  revalidatePath("/admin/orders");
}
