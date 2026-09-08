import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MascotMark } from "@/components/mascot-mark";
import { PeriodSwitcher } from "@/components/period-switcher";

/**
 * The slim header for every secondary public page (menu, checkout, order
 * status, queue, corkboard, case study) — replaces what used to be a bare
 * "Back to the site" text link repeated (with small drifts) on each page.
 * The homepage keeps its own richer header with the full link row; this is
 * deliberately lighter since those pages are a focused task, not a
 * browsing hub, but still needs a way home and the period switcher, which
 * used to only exist on the homepage.
 */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-6 sm:px-8">
      <Link
        href="/"
        aria-label="Back to the site"
        className="flex flex-none items-center gap-2 text-ink transition-colors duration-base hover:text-ink-2"
      >
        <ArrowLeft size={16} className="flex-none text-ink-3" />
        <MascotMark className="h-6 w-6 flex-none" />
        <span className="hidden font-display text-lg font-bold tracking-[-0.02em] sm:inline">
          Depresso
        </span>
      </Link>
      <PeriodSwitcher />
    </header>
  );
}
