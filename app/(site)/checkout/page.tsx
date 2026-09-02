import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-8 py-16">
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2"
        >
          <ArrowLeft size={13} />
          Back to the menu
        </Link>
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-ink">Checkout</h1>
      </div>
      <CheckoutForm />
    </main>
  );
}
