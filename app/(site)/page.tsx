import { PeriodSwitcher } from "@/components/period-switcher";
import { HeroCopy } from "@/components/hero-copy";
import { AmbientMixer } from "@/components/ambient-mixer";
import { Mascot } from "@/components/mascot";

export default function Home() {
  return (
    <>
      <header className="flex items-center justify-between px-8 py-6">
        <span className="flex items-center gap-2">
          <Mascot className="h-12 w-auto" />
          <span className="font-display text-lg font-bold tracking-[-0.02em] text-ink">
            Depresso
          </span>
        </span>
        <PeriodSwitcher />
      </header>
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-32 text-center"
      >
        <HeroCopy />
      </main>
      <section className="flex flex-col gap-6 px-8 pb-24">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-[-0.025em] text-ink">
            Build the room
          </h2>
          <p className="max-w-md font-body text-base leading-relaxed text-ink-2">
            Four loops, four faders. Set it how you like it and we will
            remember.
          </p>
        </div>
        <AmbientMixer />
      </section>
    </>
  );
}
