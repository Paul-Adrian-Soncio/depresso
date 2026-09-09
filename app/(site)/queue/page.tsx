import { getActiveOrders } from "@/lib/db/orders";
import { PublicQueueController } from "@/components/public-queue-controller";
import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";

export default async function QueuePage() {
  const orders = await getActiveOrders();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 px-8 py-16">
        <PageHeader
          title="The pickup screen"
          description="What's brewing and what's ready — same as the screen above the counter. Every order here is real, placed by someone through the menu."
        />
        <PublicQueueController initialOrders={orders} />
      </main>
    </>
  );
}
