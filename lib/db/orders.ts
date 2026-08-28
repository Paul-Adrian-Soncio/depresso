import "server-only";
import { createServiceRoleClient } from "@/lib/db/client";
import type { Database } from "@/lib/db/database.types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];

export interface QueueOrder {
  id: string;
  customerName: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  items: { menuItemName: string; quantity: number }[];
}

const ACTIVE_STATUSES: OrderStatus[] = ["received", "brewing", "ready"];

/**
 * Orders still in motion — what a real barista queue would show, not the
 * full order history (that's what analytics reads). Oldest first, so the
 * next order to act on is at the top.
 */
export async function getActiveOrders(): Promise<QueueOrder[]> {
  const supabase = createServiceRoleClient();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, customer_name, status, total_cents, created_at")
    .in("status", ACTIVE_STATUSES)
    .order("created_at", { ascending: true });

  if (ordersError) throw ordersError;
  if (!orders || orders.length === 0) return [];

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("order_id, quantity, menu_items (name)")
    .in(
      "order_id",
      orders.map((o) => o.id),
    );

  if (itemsError) throw itemsError;

  const itemsByOrder = new Map<string, { menuItemName: string; quantity: number }[]>();
  for (const row of items ?? []) {
    const list = itemsByOrder.get(row.order_id) ?? [];
    list.push({ menuItemName: row.menu_items?.name ?? "Unknown item", quantity: row.quantity });
    itemsByOrder.set(row.order_id, list);
  }

  return orders.map((order) => ({
    id: order.id,
    customerName: order.customer_name,
    status: order.status,
    totalCents: order.total_cents,
    createdAt: order.created_at,
    items: itemsByOrder.get(order.id) ?? [],
  }));
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  received: "brewing",
  brewing: "ready",
  ready: "completed",
};

export function getNextStatus(current: OrderStatus): OrderStatus | null {
  return NEXT_STATUS[current] ?? null;
}
