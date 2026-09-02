import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/db/orders";
import { OrderStatus } from "@/components/order-status";

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-8 py-16">
      <Link
        href="/"
        className="flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2"
      >
        <ArrowLeft size={13} />
        Back to the menu
      </Link>
      <OrderStatus initialOrder={order} />
    </main>
  );
}
