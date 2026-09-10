import { Mascot } from "@/components/mascot";
import { BackLink } from "@/components/back-link";

/**
 * Title and mascot repeated across every secondary public page. Home is
 * already reachable from SiteHeader's wordmark, so this only renders its
 * own back link when a page needs to point somewhere more specific than
 * home (checkout and order-status point back to /menu, since that's what
 * they actually follow from).
 *
 * The mascot/title row is a two-column grid (`auto` mascot column, `1fr`
 * text column) rather than a flex row — flex's `items-stretch` plus an
 * `<svg>` using `h-full` created a feedback loop (the SVG, a replaced
 * element, inflated the row's own stretch calculation instead of just
 * following it), which either blew the mascot up to fill the whole page or
 * collapsed both columns on top of each other depending on the wrapper.
 *
 * Below `sm` the row uses `items-start` with a fixed mascot height (not
 * `items-stretch`/a height tied to content) on purpose: a longer
 * description (e.g. /queue's full sentence vs. /menu's short one) wraps to
 * more lines on a real phone than Chrome DevTools' mobile emulation showed
 * during testing — emulation doesn't perfectly reproduce a real device's
 * font metrics/line-wrapping. A content-linked mascot height silently grew
 * past what a hand-tuned `max-h` guess was checked against, and the title
 * block overlapped the content below it. A fixed height can't be thrown
 * off by text length, so this stays correct regardless of how many lines
 * a given page's copy happens to wrap to, on any device.
 */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  compact,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  /** Shrinks the mascot/title/description on mobile so this fits inline
   * next to something else in the same row (e.g. CartDrawer on /menu)
   * instead of needing to stack below it. */
  compact?: boolean;
}) {
  return (
    <div className="flex flex-none flex-col gap-3 self-start">
      {backHref && <BackLink href={backHref} label={backLabel} />}
      <div className="grid grid-cols-[auto_1fr] items-start gap-4 sm:items-stretch">
        <Mascot
          className={`w-auto sm:h-full sm:max-h-none ${compact ? "h-20" : "h-24"}`}
        />
        <div className="flex flex-col justify-center gap-1 sm:gap-2">
          <h1
            className={`font-bold tracking-[-0.025em] text-ink sm:whitespace-nowrap ${
              compact ? "text-2xl sm:text-[30px]" : "text-[30px]"
            }`}
          >
            {title}
          </h1>
          {description && (
            <p className="max-w-lg font-body text-sm text-ink-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
