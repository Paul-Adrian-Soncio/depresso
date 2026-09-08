import { CartDrawer } from "@/components/cart-drawer";
import { MenuGrid } from "@/components/menu-grid";
import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";

export default function MenuPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 px-8 py-16">
        <div className="flex items-center justify-between gap-3">
          <PageHeader title="Order ahead" description="The full menu, nine drinks" compact />
          <CartDrawer />
        </div>
        <MenuGrid />
      </main>
    </>
  );
}
