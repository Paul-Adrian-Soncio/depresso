import { NextResponse } from "next/server";
import { getActiveOrders, advanceRandomActiveOrder } from "@/lib/db/orders";

/**
 * The public queue page's "run the queue" toggle — unlike admin's
 * simulation mode (app/api/simulation/tick), this only ever advances an
 * order already in the queue. It never creates one, so it's safe to leave
 * unauthenticated (not behind the admin proxy gate): a visitor can watch
 * real orders move through received -> brewing -> ready -> completed
 * without needing the admin password, but can't fabricate activity or
 * touch anything the admin side doesn't already expose read access to via
 * getActiveOrders.
 */
export async function POST() {
  const advanced = await advanceRandomActiveOrder();
  const orders = await getActiveOrders();
  return NextResponse.json({ advanced, orders });
}

export async function GET() {
  const orders = await getActiveOrders();
  return NextResponse.json({ orders });
}
