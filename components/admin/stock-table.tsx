"use client";

import { useState, useTransition } from "react";
import { adjustStock, setStock } from "@/app/admin/(dashboard)/stock/actions";
import type { IngredientWithStatus } from "@/lib/db/ingredients";

const QUICK_ADJUST_STEPS = [-50, -10, 10, 50, 100];

function StockRow({ ingredient }: { ingredient: IngredientWithStatus }) {
  const [isPending, startTransition] = useTransition();
  // Local override only while the input actually differs from the server
  // value — once a set/adjust action revalidates and the real value
  // matches what was typed, this clears, so the field goes back to
  // tracking the server truth instead of staying pinned to stale local
  // state (e.g. if another admin changed stock concurrently).
  const [draftOverride, setDraftOverride] = useState<string | null>(null);
  const draftValue = draftOverride ?? String(ingredient.stockQuantity);
  const draftDiffers = draftOverride !== null && draftOverride !== String(ingredient.stockQuantity);

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-ink">{ingredient.name}</p>
        <p className="font-mono text-xs text-ink-3">unit: {ingredient.unit}</p>
      </td>
      <td className="px-4 py-3">
        <span
          className={`font-mono text-xs uppercase tracking-[0.08em] ${
            ingredient.isLow ? "text-accent-text" : "text-ok"
          }`}
        >
          {ingredient.isLow ? "Low stock" : "OK"}
        </span>
        <p className="font-mono text-[11px] text-ink-3">threshold: {ingredient.lowStockThreshold}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={draftValue}
            disabled={isPending}
            onChange={(event) => setDraftOverride(event.target.value)}
            className="w-24 rounded-sm border border-line-strong bg-ground px-2 py-1 font-mono text-sm tabular-nums text-ink outline-none focus-visible:border-accent disabled:opacity-50"
          />
          <button
            type="button"
            disabled={isPending || !draftDiffers}
            onClick={() =>
              startTransition(async () => {
                await setStock(ingredient.id, Number(draftValue));
                setDraftOverride(null);
              })
            }
            className="rounded-sm border border-line-strong px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-ink-3 transition-colors duration-base hover:text-ink-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Set
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_ADJUST_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await adjustStock(ingredient.id, step);
                  // Revalidation has landed by the time the action resolves;
                  // clear the override so the field reflects the real
                  // server value on the next render rather than a
                  // client-guessed one.
                  setDraftOverride(null);
                })
              }
              className="rounded-sm bg-surface-2 px-2 py-1 font-mono text-xs tabular-nums text-ink-2 transition-colors duration-base hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step > 0 ? `+${step}` : step}
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
}

export function StockTable({ ingredients }: { ingredients: IngredientWithStatus[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-surface-2">
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Ingredient</th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Status</th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Quantity</th>
            <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Quick adjust</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <StockRow key={ingredient.id} ingredient={ingredient} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
