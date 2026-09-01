import Link from "next/link";
import { KeyRound } from "lucide-react";
import { PeriodSwitcher } from "@/components/period-switcher";
import { HeroCopy } from "@/components/hero-copy";
import { HeroScene } from "@/components/hero-scene";
import { MenuGrid } from "@/components/menu-grid";
import { AmbientMixer } from "@/components/ambient-mixer";
import { Mascot } from "@/components/mascot";

export default function Home() {
  return (
    <>
      <header className="flex items-center justify-between px-8 py-6">
        <span className="font-display text-lg font-bold tracking-[-0.02em] text-ink">
          Depresso
        </span>
        <div className="flex items-center gap-3">
          <PeriodSwitcher />
          <Link
            href="/admin"
            aria-label="Admin"
            title="Admin"
            className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2"
          >
            <KeyRound size={13} />
            Admin
          </Link>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center gap-16 px-8 py-16 lg:flex-row lg:items-center lg:py-24"
      >
        <div className="flex w-full max-w-lg flex-none flex-col items-center gap-4 text-center lg:items-start lg:text-left">
          <Mascot className="h-16 w-auto" />
          <HeroCopy />
        </div>
        <HeroScene className="w-full max-w-2xl flex-1 rounded-md border border-line" />
      </main>
      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-[22px] px-8 pb-24">
        <div className="flex items-baseline gap-4">
          <h2 className="text-[30px] font-bold tracking-[-0.025em] text-ink">
            On today
          </h2>
          <p className="font-mono text-xs text-ink-3">The full menu, nine drinks</p>
        </div>
        <MenuGrid />
      </section>
      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-8 pb-24 lg:flex-row lg:items-start">
        <div className="flex w-full max-w-sm flex-none flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-[-0.025em] text-ink">
            Build the room
          </h2>
          <p className="font-body text-base leading-relaxed text-ink-2">
            Four loops, four faders. Set it how you like it and we will
            remember.
          </p>
        </div>
        <div className="w-full flex-1">
          <AmbientMixer />
        </div>
      </section>
    </>
  );
}
