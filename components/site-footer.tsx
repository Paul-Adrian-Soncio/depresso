import { Mascot } from "@/components/mascot";
import { PersistentPlayer } from "@/components/persistent-player";

/**
 * Normal in-flow footer, not fixed/sticky — the player lives here rather
 * than pinned to the viewport, so it scrolls away like any other footer
 * content instead of permanently occupying screen space on every page. The
 * demo badge is CLAUDE.md's rule 4 ("admit it's a demo") — this is its
 * first home; a "small persistent badge" fits naturally next to the
 * branding rather than needing its own dedicated spot.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-6 px-8 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Mascot className="h-9 w-auto" />
          <div className="flex flex-col gap-1">
            <span className="font-display text-sm font-bold tracking-[-0.02em] text-ink">
              Depresso
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              Demo — no real orders, no real payments
            </span>
          </div>
        </div>
        <PersistentPlayer />
      </div>
    </footer>
  );
}
