"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useCartContext } from "@/components/cart-provider";
import { cartTotalCents } from "@/lib/domain/cart";
import { checkout } from "@/app/(site)/checkout/actions";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

type Stage = "form" | "processing" | "declined";

/**
 * The decline path is real (see app/(site)/checkout/actions.ts) but framed
 * so it reads as a demonstrated feature, not broken code: the note above
 * the button says upfront that declines happen on purpose sometimes, the
 * decline state itself is calm (no red alert styling), and retrying always
 * has fresh odds — nothing here can leave a visitor stuck.
 */
export function CheckoutForm() {
  const { cart, clear } = useCartContext();
  const [name, setName] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const total = cartTotalCents(cart);

  function submit() {
    if (!name.trim() || cart.length === 0) return;
    setStage("processing");

    startTransition(async () => {
      // A brief pause before resolving — makes "processing" legible as a
      // real step rather than an instant no-op, matching the pacing of an
      // actual payment call.
      await new Promise((resolve) => setTimeout(resolve, 900));

      const result = await checkout(
        name.trim(),
        cart.map((line) => ({
          menuItemId: line.menuItemId,
          menuItemName: line.menuItemName,
          quantity: line.quantity,
          unitPriceCents: line.priceCents,
        })),
      );

      if (result.status === "declined") {
        setStage("declined");
        return;
      }

      clear();
      router.push(`/order/${result.orderId}`);
    });
  }

  if (cart.length === 0) {
    return (
      <p className="rounded-md border border-line bg-surface p-6 font-body text-sm text-ink-2">
        Your cart is empty — add a drink from the menu first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4">
        {cart.map((line) => (
          <div key={line.menuItemId} className="flex items-baseline justify-between gap-4">
            <span className="font-body text-sm text-ink-2">
              {line.quantity}× {line.menuItemName}
            </span>
            <span className="font-mono text-xs tabular-nums text-ink-3">
              {formatPrice(line.priceCents * line.quantity)}
            </span>
          </div>
        ))}
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Total</span>
          <span className="font-mono text-lg tabular-nums text-ink">{formatPrice(total)}</span>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
          What should we call your order?
        </span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="First name"
          disabled={stage !== "form"}
          className="rounded-sm border border-line-strong bg-ground px-3 py-2 font-mono text-sm text-ink outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      {stage === "declined" ? (
        <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4">
          <p className="font-body text-sm text-ink-2">
            That one didn&apos;t go through — try again?
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="flex w-fit items-center gap-1.5 rounded-md bg-accent px-4 py-2 font-display text-sm font-bold text-on-accent transition-colors duration-base hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={14} />
            Retry payment
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] text-ink-3">
            Simulated payment — this is a demo, no real charge happens. Declines
            occasionally happen on purpose, so you can see how a retry works.
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim() || stage === "processing"}
            className="flex items-center justify-center rounded-md bg-accent px-4 py-3 font-display text-sm font-bold text-on-accent transition-colors duration-base hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {stage === "processing" ? "Processing…" : `Pay ${formatPrice(total)}`}
          </button>
        </div>
      )}
    </div>
  );
}
