import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PLAYLIST } from "@/lib/domain/playlist";

interface CreditEntry {
  name: string;
  detail: string;
  href?: string;
}

const STACK: CreditEntry[] = [
  { name: "Next.js", detail: "App Router, framework", href: "https://nextjs.org" },
  { name: "React", detail: "UI library", href: "https://react.dev" },
  { name: "Tailwind CSS", detail: "Styling", href: "https://tailwindcss.com" },
  { name: "Supabase", detail: "Postgres, Auth, Realtime, Storage", href: "https://supabase.com" },
  { name: "Lucide", detail: "Icons", href: "https://lucide.dev" },
  { name: "TypeScript", detail: "Language", href: "https://www.typescriptlang.org" },
  { name: "Bricolage Grotesque", detail: "Display type", href: "https://fonts.google.com/specimen/Bricolage+Grotesque" },
  { name: "Newsreader", detail: "Body type", href: "https://fonts.google.com/specimen/Newsreader" },
  { name: "DM Mono", detail: "Labels, prices, timestamps", href: "https://fonts.google.com/specimen/DM+Mono" },
];

const AMBIENT_TRACKS: CreditEntry[] = [
  { name: "Rain", detail: "Ambient loop" },
  { name: "Café chatter", detail: "Ambient loop" },
  { name: "Vinyl crackle", detail: "Ambient loop" },
  { name: "Espresso machine", detail: "Ambient loop" },
];

function Decision({
  number,
  title,
  chosen,
  why,
  tradeoff,
}: {
  number: string;
  title: string;
  chosen: React.ReactNode;
  why: React.ReactNode;
  tradeoff: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-accent-text">{number}</span>
        <h3 className="text-xl font-bold tracking-[-0.02em] text-ink">{title}</h3>
      </div>
      <div className="flex flex-col gap-3 font-body text-[15px] leading-relaxed text-ink-2">
        <p>{chosen}</p>
        <p>
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Why — </span>
          {why}
        </p>
        <p>
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">Tradeoff — </span>
          {tradeoff}
        </p>
      </div>
    </div>
  );
}

function CreditRow({ name, detail, href }: CreditEntry) {
  const content = (
    <>
      <span className="font-display text-sm font-bold text-ink">{name}</span>
      <span className="font-mono text-xs text-ink-3">{detail}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-4 px-4 py-3 transition-colors duration-base hover:bg-surface-2"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center justify-between gap-4 px-4 py-3">{content}</div>;
}

export default function CaseStudyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-16 px-8 py-16">
      <div className="flex flex-col gap-6">
        <Link
          href="/"
          className="flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2"
        >
          <ArrowLeft size={13} />
          Back to the site
        </Link>
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-text">
            Case study
          </p>
          <h1 className="text-4xl font-bold tracking-[-0.03em] text-ink">
            Building a coffee shop nobody visits
          </h1>
          <p className="max-w-xl font-body text-lg leading-relaxed text-ink-2">
            Depresso is a simulation — no real customers, no real espresso, every
            table seeded. That constraint shaped the whole build: the point wasn&apos;t
            to launch a coffee shop, it was to demonstrate a real backend without
            a real business behind it.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">
          The problem
        </h2>
        <p className="font-body text-[15px] leading-relaxed text-ink-2">
          Supabase makes it trivially easy to ship a project with no backend of
          your own — client-side queries plus row-level security policies, and
          you&apos;re done. For a portfolio project whose entire point is proving
          fullstack ability, that convenience undermines the exercise. The harder,
          more honest problem was building something that used Supabase as
          Postgres-plus-auth, kept business logic server-side, and gave a reviewer
          something to actually watch happen — not just a UI backed by a database
          they have to trust exists.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">
          Three decisions
        </h2>

        <Decision
          number="01"
          title="Stock deduction runs inside Postgres, not the app"
          chosen={
            <>
              Deducting ingredient stock for an order is a single Postgres
              function — <code className="font-mono text-sm text-ink">deduct_stock_for_order</code> —
              that locks each ingredient row with{" "}
              <code className="font-mono text-sm text-ink">SELECT ... FOR UPDATE</code>{" "}
              before checking and decrementing it, inside the same transaction as
              the check. If two orders race for the last unit of oat milk, the
              second one genuinely fails and rolls back — it doesn&apos;t just get
              unlucky with a UI-level check that was already stale by the time it
              ran.
            </>
          }
          why={
            <>
              This is the one place where correctness under concurrency actually
              matters, and it&apos;s the kind of bug that&apos;s invisible in a demo and
              real in production — two people click &quot;buy&quot; on the last unit at the
              same instant, and without a row lock, both succeed and the shop sold
              something it didn&apos;t have.
            </>
          }
          tradeoff={
            <>
              It means real domain logic lives in SQL, not TypeScript — harder to
              unit test with the usual tooling, and it only shows up if a reviewer
              opens the migration file rather than clicking around the UI. Worth
              it anyway: it&apos;s the single strongest proof that this isn&apos;t just CRUD
              with an admin panel bolted on.
            </>
          }
        />

        <Decision
          number="02"
          title="The whole site runs on a clock, not just the copy"
          chosen={
            <>
              A cool palette with one warm light source (&quot;Night Window&quot;) that
              shifts across four time periods — morning, afternoon, dusk, late —
              driven by a single <code className="font-mono text-sm text-ink">data-period</code>{" "}
              attribute on the page. The hero art, the copy, the ambient audio and
              every color token move together on the same clock, so the site
              reads as one place across a whole day rather than a static page
              that happens to mention time.
            </>
          }
          why={
            <>
              A palette that just repaints the whole screen per period would have
              been easier, but it reads as decoration, not behavior. Moving one
              light source instead — the lamp warms, the windows across the
              street go dark, the rain eases — is what makes it feel like the
              room actually exists in time. A manual override in the header
              means a reviewer sees all four in ten seconds instead of needing to
              return at 3am.
            </>
          }
          tradeoff={
            <>
              Cold grounds are unflattering to food and drink, so the warm accent
              has to carry all the appetite appeal on the menu by itself — there
              was no headroom left in the surface colors to help. And keeping the
              admin section visually locked to one period, independent of
              whatever a visitor last picked on the public site, turned out to
              need its own explicit fix (twice) once client-side navigation
              entered the picture — see the debugging note below.
            </>
          }
        />

        <Decision
          number="03"
          title="A demo control that only closes the loop it claims to"
          chosen={
            <>
              Simulation mode places and advances real fake orders every few
              seconds, calling the exact same stock-deduction function a real
              order would — not a mocked version, the real one, against real
              menu availability. It was built instead of a full customer-facing
              order-ahead flow, because the actual gap was &quot;nothing ever creates
              an order&quot;, not &quot;there&apos;s no cart UI&quot;.
            </>
          }
          why={
            <>
              The inventory schema, the derived sold-out state, and the
              race-safe deduction function all existed before this — but nothing
              ever called them, because every order in the database came from
              the seed script. Simulation mode is the smallest thing that makes
              that backend actually run, live, in front of a reviewer: stock
              drops, an item goes sold-out, the queue moves — no code reading
              required.
            </>
          }
          tradeoff={
            <>
              It runs client-side while an admin tab is open, not as a
              background job — a deliberate choice for a demo control rather
              than production infrastructure, but it means the &quot;live&quot; loop stops
              the moment that tab closes. A cart-and-checkout flow would be more
              complete, but it would have shipped a UI without also closing the
              gap that actually mattered.
            </>
          }
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">
          A debugging story
        </h2>
        <p className="font-body text-[15px] leading-relaxed text-ink-2">
          The persistent player&apos;s visualizer looked wrong the moment real music
          started playing: tall bars at the very start of the row, flat
          everywhere else, barely reacting to the beat. The cause wasn&apos;t a bug in
          the audio graph — Web Audio&apos;s{" "}
          <code className="font-mono text-sm text-ink">getByteFrequencyData</code>{" "}
          was working exactly as documented. It returns linearly-spaced
          frequency bins, but music energy — lofi&apos;s especially — is concentrated
          in the bass and low-mid, so mapping bars one-to-one against those bins
          put nearly all the audible signal into the first few bars and starved
          everything else.
        </p>
        <p className="font-body text-[15px] leading-relaxed text-ink-2">
          The fix took two passes, and the first one was still wrong: an
          exponentially-widening bin range per bar helped, but the last several
          bars stayed pinned at the floor with zero frame-to-frame movement no
          matter what was playing — correct, given these tracks have almost no
          energy that high up the spectrum, but it still read as broken. The
          actual fix was narrower than that: cap the mapped range to the bottom
          fifth of the spectrum and drop the bar count, so every visible bar
          sits inside the part of the spectrum this music actually occupies.
          Verified by sampling real bar heights across frames during live
          playback, not by eyeballing it — the kind of bug that&apos;s easy to
          &quot;fix&quot; twice without ever confirming it&apos;s actually fixed.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">
          Built using
        </h2>
        <p className="font-body text-[15px] leading-relaxed text-ink-2">
          Every dependency and audio source, credited in one place.
        </p>
        <div className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
          {STACK.map((entry) => (
            <CreditRow key={entry.name} {...entry} />
          ))}
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
          Player tracks — from{" "}
          <a
            href="https://freetouse.com/music"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-line-strong underline-offset-2 hover:text-ink-2"
          >
            Free To Use
          </a>
        </p>
        <div className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
          {PLAYLIST.map((track) => (
            <CreditRow key={track.id} name={track.title} detail={track.artist} />
          ))}
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
          Ambient loops — from Pixabay
        </p>
        <div className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
          {AMBIENT_TRACKS.map((entry) => (
            <CreditRow key={entry.name} {...entry} />
          ))}
        </div>
      </div>
    </main>
  );
}
