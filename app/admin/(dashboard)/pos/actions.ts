"use server";

import { revalidatePath } from "next/cache";
import { placeOrder, type NewOrderLine } from "@/lib/db/orders";

export interface RingUpResult {
  orderId: string;
  cancelled: boolean;
}

/**
 * Staff ring-up — unlike the customer checkout (app/(site)/checkout/actions.ts),
 * this always resolves immediately: no simulated processing delay, no
 * simulated decline. That framing made sense for demonstrating error
 * handling in a customer-facing flow; a staff tool ringing up drink after
 * drink all day shouldn't have to fight a fake gateway. Stock still
 * deducts for real through the same race-safe placeOrder() every other
 * order-creation path uses (order-ahead checkout, admin simulation mode).
 */
export async function ringUp(customerName: string, lines: NewOrderLine[]): Promise<RingUpResult> {
  const placed = await placeOrder(customerName, lines);

  revalidatePath("/admin/orders");
  revalidatePath("/admin/stock");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/queue");
  revalidatePath("/menu");

  return { orderId: placed.orderId, cancelled: placed.cancelled };
}
