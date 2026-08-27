import type { Period } from "@/lib/domain/period";
import { getPeriod } from "@/lib/period";
import { PeriodSwitcher } from "@/components/period-switcher";

const EYEBROW: Record<Period, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  dusk: "Dusk",
  late: "Late",
};

export default async function Home() {
  const { period } = await getPeriod();

  return (
    <>
      <header className="flex items-center justify-between px-8 py-6">
        <span className="font-display text-lg font-bold tracking-[-0.02em] text-ink">
          Depresso
        </span>
        <PeriodSwitcher initial={period} />
      </header>
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-32 text-center"
      >
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-text">
          {EYEBROW[period]} · Perth
        </p>
        <h1 className="max-w-2xl text-5xl font-bold tracking-[-0.04em] text-ink">
          Nothing here is urgent.
        </h1>
        <p className="max-w-md font-body text-lg leading-relaxed text-ink-2">
          A small room with bad lighting and good coffee. Order ahead, or
          just sit with the rain for a while.
        </p>
      </main>
    </>
  );
}
