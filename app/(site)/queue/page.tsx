import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveOrders } from "@/lib/db/orders";
import { PublicQueueController } from "@/components/public-queue-controller";

export default async function QueuePage() {
  const orders = await getActiveOrders();

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-8 py-16">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2"
        >
          <ArrowLeft size={13} />
          Back to the site
        </Link>
        <h1 className="text-[30px] font-bold tracking-[-0.025em] text-ink">The pickup screen</h1>
        <p className="max-w-lg font-body text-sm text-ink-2">
          What&apos;s brewing and what&apos;s ready — same as the screen above the
          counter. Every order here is real, placed by someone through the
          menu.
        </p>
      </div>
      <PublicQueueController initialOrders={orders} />
    </main>
  );
}
