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

export interface NewOrderLine {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPriceCents: number;
}

export interface PlacedOrder {
  orderId: string;
  customerName: string;
  lines: NewOrderLine[];
  totalCents: number;
  cancelled: boolean;
}

/**
 * Creates an order at "received" and deducts stock for it via
 * deduct_stock_for_order (the SELECT ... FOR UPDATE race-condition guard) in
 * the same call — this is the one path meant to call that function, per the
 * comment in orders/actions.ts. If stock ran out between the caller checking
 * availability and this running, the function raises and this rolls the
 * order back to "cancelled" instead of leaving a phantom order that was
 * never actually fulfilled.
 */
export async function placeOrder(
  customerName: string,
  lines: NewOrderLine[],
): Promise<PlacedOrder> {
  const supabase = createServiceRoleClient();
  const totalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ customer_name: customerName, status: "received", total_cents: totalCents })
    .select("id")
    .single();

  if (orderError) throw orderError;

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      menu_item_id: line.menuItemId,
      quantity: line.quantity,
      unit_price_cents: line.unitPriceCents,
    })),
  );

  if (itemsError) throw itemsError;

  const { error: deductError } = await supabase.rpc("deduct_stock_for_order", {
    p_order_id: order.id,
  });

  let cancelled = false;
  if (deductError) {
    const { error: cancelError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);
    if (cancelError) throw cancelError;
    cancelled = true;
  }

  return { orderId: order.id, customerName, lines, totalCents, cancelled };
}

/**
 * One random active order advanced to its next status, or null if none are
 * eligible (empty queue, or everything already sitting at "ready" waiting
 * to be picked up). Used by simulation mode so the queue has movement
 * without every tick necessarily creating a brand new order.
 */
export async function advanceRandomActiveOrder(): Promise<{ orderId: string; nextStatus: OrderStatus } | null> {
  const supabase = createServiceRoleClient();

  const { data: candidates, error } = await supabase
    .from("orders")
    .select("id, status")
    .in("status", ["received", "brewing"]);

  if (error) throw error;
  if (!candidates || candidates.length === 0) return null;

  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const nextStatus = getNextStatus(target.status);
  if (!nextStatus) return null;

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", target.id);

  if (updateError) throw updateError;

  return { orderId: target.id, nextStatus };
}
