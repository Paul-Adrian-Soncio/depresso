"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { resetDemoDataAction } from "@/app/admin/(dashboard)/admincontrols/actions";

type Status = { orders: number; orderItems: number } | "error" | null;

export function ResetDemoDataButton() {
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [isPending, startTransition] = useTransition();

  function runReset() {
    setConfirming(false);
    startTransition(async () => {
      try {
        const result = await resetDemoDataAction();
        setStatus(result);
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {confirming ? (
        <div className="flex flex-col items-start gap-3 rounded-md border border-line-strong bg-surface p-4">
          <p className="font-body text-sm text-ink-2">
            This wipes every order and rebuilds ~90 days of history from scratch, for
            everyone currently on the site — there is one shared database, not a
            session-scoped copy. Proceed?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={runReset}
              disabled={isPending}
              className="rounded-md bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] text-on-accent transition-colors duration-base hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Yes, reset everything
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="rounded-md border border-line-strong px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-2 transition-colors duration-base hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={isPending}
          className="flex w-fit items-center gap-1.5 rounded-md bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] text-on-accent transition-colors duration-base hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw size={13} />
          {isPending ? "Resetting…" : "Reset demo data"}
        </button>
      )}

      {status === "error" && (
        <p className="font-mono text-xs text-accent-text">
          Reset failed — nothing was changed. Check the server logs.
        </p>
      )}
      {status && status !== "error" && (
        <p className="font-mono text-xs text-ok">
          Done — {status.orders} orders, {status.orderItems} order items restored.
        </p>
      )}
    </div>
  );
}
