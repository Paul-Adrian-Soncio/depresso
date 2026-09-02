import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CartDrawer } from "@/components/cart-drawer";
import { MenuGrid } from "@/components/menu-grid";

export default function MenuPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-8 py-16">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2"
          >
            <ArrowLeft size={13} />
            Back to the site
          </Link>
          <h1 className="text-[30px] font-bold tracking-[-0.025em] text-ink">Order ahead</h1>
          <p className="font-mono text-xs text-ink-3">The full menu, nine drinks</p>
        </div>
        <CartDrawer />
      </div>
      <MenuGrid />
    </main>
  );
}
