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
 * Grid's `items-stretch` doesn't have that ambiguity: each column gets its
 * own track, the mascot's column simply stretches to the row's real
 * content height, and it can't affect the width of the text column next
 * to it.
 */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-none flex-col gap-3 self-start">
      {backHref && <BackLink href={backHref} label={backLabel} />}
      <div className="grid grid-cols-[auto_1fr] items-stretch gap-4">
        <Mascot className="h-full max-h-24 w-auto sm:max-h-none" />
        <div className="flex flex-col justify-center gap-2">
          <h1 className="text-[30px] font-bold tracking-[-0.025em] text-ink sm:whitespace-nowrap">
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
