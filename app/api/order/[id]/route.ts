import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/db/orders";

/**
 * Polled by the customer-facing order status page (app/order/[id]) so a
 * visitor sees their order move through received -> brewing -> ready
 * without refreshing — same polling pattern as the admin's
 * SimulationController, just read-only and public (orders have no public
 * RLS policy, so this route handler is the only way a browser can see one).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
