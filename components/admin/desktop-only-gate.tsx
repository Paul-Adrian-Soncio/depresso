import { Monitor } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { BackLink } from "@/components/back-link";

/**
 * Pure CSS, no JS: the real admin content is always rendered, this overlay
 * sits on top and is shown/hidden purely by the `md:hidden` media query —
 * so there's no flash of the real dashboard on a phone before a client
 * check kicks in, and it still works with JS disabled. The admin is a
 * staff/back-office tool (POS included), not something meant to be driven
 * from a phone, so below `md` this replaces the whole section rather than
 * trying to responsively squeeze a dense multi-column dashboard down.
 */
export function DesktopOnlyGate() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-ground px-8 text-center md:hidden"
      data-period="dusk"
    >
      <div className="absolute left-8 top-8">
        <BackLink />
      </div>
      <Mascot className="h-16 w-auto" />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-accent-text">
        <Monitor size={20} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold tracking-[-0.02em] text-ink">
          The admin needs a bigger screen
        </h1>
        <p className="max-w-xs font-body text-sm text-ink-2">
          This is a staff back-office tool — dashboards, tables and the POS
          all assume real screen space. Come back on a tablet or a laptop.
        </p>
      </div>
    </div>
  );
}
