"use client";

import { PERIOD_COPY } from "@/lib/domain/copy";
import { usePeriodContext } from "@/components/period-provider";

export function HeroCopy() {
  const { period } = usePeriodContext();
  const copy = PERIOD_COPY[period];

  return (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-text">
        {copy.eyebrow} · Perth
      </p>
      <h1 className="max-w-2xl text-5xl font-bold tracking-[-0.04em] text-ink">
        {copy.headline}
      </h1>
      <p className="max-w-md font-body text-lg leading-relaxed text-ink-2">
        {copy.subhead}
      </p>
    </>
  );
}
