import { CartDrawer } from "@/components/cart-drawer";
import { MenuGrid } from "@/components/menu-grid";
import { PageHeader } from "@/components/page-header";

export default function MenuPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-8 py-16">
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="Order ahead" description="The full menu, nine drinks" />
        <CartDrawer />
      </div>
      <MenuGrid />
    </main>
  );
}
