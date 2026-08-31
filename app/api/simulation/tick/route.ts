import { NextResponse } from "next/server";
import { getMenu } from "@/lib/db/menu";
import { getActiveOrders, placeOrder, advanceRandomActiveOrder } from "@/lib/db/orders";
import { planSimulatedOrder } from "@/lib/domain/simulation";

export type SimulationEvent =
  | { type: "placed"; customerName: string; itemNames: string[]; cancelled: boolean }
  | { type: "advanced"; nextStatus: string }
  | { type: "idle" };

/**
 * One simulation step, called on an interval by the admin's simulation
 * toggle (components/admin/simulation-toggle.tsx) while it's switched on.
 * Weighted toward advancing an existing order over always placing a new
 * one, so the queue empties out as often as it fills — an unweighted coin
 * flip would let it grow without bound over a long-running demo session.
 */
export async function POST() {
  const shouldPlaceNewOrder = Math.random() < 0.4;

  let event: SimulationEvent;

  if (shouldPlaceNewOrder) {
    const menu = await getMenu();
    const plan = planSimulatedOrder(menu);
    if (plan) {
      const placed = await placeOrder(plan.customerName, plan.lines);
      event = {
        type: "placed",
        customerName: placed.customerName,
        itemNames: plan.lines.map((line) => line.menuItemName),
        cancelled: placed.cancelled,
      };
    } else {
      event = { type: "idle" };
    }
  } else {
    const advanced = await advanceRandomActiveOrder();
    event = advanced ? { type: "advanced", nextStatus: advanced.nextStatus } : { type: "idle" };
  }

  const orders = await getActiveOrders();
  return NextResponse.json({ event, orders });
}

/**
 * A pure read, no simulation step — used by SimulationController to
 * refresh its local orders list after a manual queue action (the Cancel /
 * "Mark ready" etc. buttons), which mutate through a Server Action and so
 * don't otherwise reach this component's client-side state.
 */
export async function GET() {
  const orders = await getActiveOrders();
  return NextResponse.json({ orders });
}
