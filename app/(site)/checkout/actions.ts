"use server";

import { placeOrder, type NewOrderLine } from "@/lib/db/orders";

export interface CheckoutResult {
  status: "success" | "declined";
  orderId?: string;
}

/**
 * Simulated payment gateway — CLAUDE.md's stated advantage of not using a
 * real one: it lets the demo show declines and retries instead of only the
 * happy path. Odds kept low (1 in 8) and every retry is independent, so a
 * visitor is never actually stuck — see components/checkout-form.tsx for
 * the framing that keeps a decline from reading as broken rather than
 * demonstrated on purpose.
 */
function simulatedGatewayApproves(): boolean {
  return Math.random() >= 1 / 8;
}

export async function checkout(customerName: string, lines: NewOrderLine[]): Promise<CheckoutResult> {
  if (!simulatedGatewayApproves()) {
    return { status: "declined" };
  }

  const placed = await placeOrder(customerName, lines);
  if (placed.cancelled) {
    // Stock genuinely ran out between the cart and now (a real race, not
    // the simulated gateway) — same outward shape as a decline so the
    // checkout UI doesn't need a third state, but worth its own status if
    // this ever needs distinguishing later.
    return { status: "declined" };
  }

  return { status: "success", orderId: placed.orderId };
}
