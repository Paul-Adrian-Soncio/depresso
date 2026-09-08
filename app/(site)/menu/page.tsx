import { CartDrawer } from "@/components/cart-drawer";
import { MenuGrid } from "@/components/menu-grid";
import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";

export default function MenuPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 px-8 py-16">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <PageHeader title="Order ahead" description="The full menu, nine drinks" />
          <CartDrawer />
        </div>
        <MenuGrid />
      </main>
    </>
  );
}
