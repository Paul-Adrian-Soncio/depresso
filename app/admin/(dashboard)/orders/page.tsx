import { getActiveOrders } from "@/lib/db/orders";
import { OrderQueue } from "@/components/admin/order-queue";

export default async function AdminOrdersPage() {
  const orders = await getActiveOrders();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Orders</h1>
        <p className="font-body text-sm text-ink-2">
          Active orders only — received, brewing, or ready. Completed and cancelled
          orders live in analytics, not here.
        </p>
      </div>
      <OrderQueue orders={orders} />
    </div>
  );
}
