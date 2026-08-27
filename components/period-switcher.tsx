"use client";

import { useTransition } from "react";
import { PERIODS, type Period } from "@/lib/domain/period";
import { usePeriodContext } from "@/components/period-provider";

const LABELS: Record<Period, string> = {
  morning: "Morn",
  afternoon: "Aft",
  dusk: "Dusk",
  late: "Late",
};

export function PeriodSwitcher() {
  const { period: active, setPeriod } = usePeriodContext();
  const [isPending, startTransition] = useTransition();

  function select(period: Period) {
    if (period === active) return;
    setPeriod(period);

    startTransition(() => {
      fetch("/api/period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, manual: true }),
      }).catch(() => {});
    });
  }

  return (
    <div
      role="group"
      aria-label="Time of day"
      className="flex items-center gap-1.5 rounded-md border border-line bg-surface p-1.5"
    >
      {PERIODS.map((period) => (
        <button
          key={period}
          type="button"
          aria-pressed={period === active}
          disabled={isPending && period !== active}
          onClick={() => select(period)}
          className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors duration-base ${
            period === active
              ? "bg-accent text-on-accent"
              : "text-ink-3 hover:text-ink-2"
          }`}
        >
          {LABELS[period]}
        </button>
      ))}
    </div>
  );
}
