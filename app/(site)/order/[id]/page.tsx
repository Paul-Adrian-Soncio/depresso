import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/db/orders";
import { OrderStatus } from "@/components/order-status";
import { BackLink } from "@/components/back-link";
import { SiteHeader } from "@/components/site-header";

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-8 py-16">
        <BackLink href="/menu" label="Back to the menu" />
        <OrderStatus initialOrder={order} />
      </main>
    </>
  );
}
