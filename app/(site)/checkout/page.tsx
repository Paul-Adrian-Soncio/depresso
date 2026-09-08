import { CheckoutForm } from "@/components/checkout-form";
import { PageHeader } from "@/components/page-header";

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-8 py-16">
      <PageHeader title="Checkout" backHref="/menu" backLabel="Back to the menu" />
      <CheckoutForm />
    </main>
  );
}
