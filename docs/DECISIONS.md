# Decisions

Running log. Add a row when something gets settled; move an open question up
when it closes. Keep the reasoning — future-you will want to know *why*, not
just *what*.

**Nothing here is final.** A settled decision is settled *for now*; if
development shows one to be wrong, reverse it and write down why. A reversal
with its reasoning is more useful than a plan that pretended to be right.

---

## Settled

### 2026-08-26 — This is a simulation, not a product
No real users, no real money. All data seeded. Consequence: the five demo rules
in `CLAUDE.md` govern feature design, and "no empty states" becomes a hard
requirement rather than a nice-to-have.

### 2026-08-26 — Stack: Next.js + Tailwind + Lucide + Supabase
Chosen partly for familiarity — Supabase and Postgres are already known, which
buys time for the parts that are new.

**Consequence, and it matters:** Supabase makes it easy to ship a project with
no backend of your own — client-side `supabase-js` plus RLS policies. For a
project whose stated purpose is proving fullstack ability, that undermines the
whole exercise. So Supabase is used as *Postgres plus auth*, not as a
backend-as-a-service. See the architecture rules in `CLAUDE.md`.

**Upsides:** Supabase Realtime makes the order queue far cheaper than
hand-rolled WebSockets, which improves the economics of the operations layer.
`supabase/seed.sql` plus `db reset` makes "reset demo data" nearly free.

### 2026-08-26 — Palette: Night Window
A cool ground with a single warm light source — a cold room, rain on the glass,
one sodium streetlight outside. Chosen over "Roastery" (warm neutrals with a raw
green-bean accent) and "Cassette" (faded print inks).

**Why:** the four time-of-day periods *move the light* rather than repainting the
room, so the site stays recognisably one place across a whole day. That is the
behaviour the entire time-of-day engine depends on, and the other two directions
made it harder. It also suits the name — the melancholy is doing real work.

**Watch for:** cold grounds are unflattering to food and drink, so the warm
accent has to carry the appetite appeal on the menu. If drinks start looking
unappetising, warm the surfaces before touching the accent.

Tokens for all four periods are in `CLAUDE.md`.

### 2026-08-26 — Type: Editorial Melancholy
Bricolage Grotesque (display) / Newsreader (body) / DM Mono (labels and data).
Chosen over a single-family Recursive setup and a Young Serif + Karla pairing.

**Why:** the grotesque-over-serif contrast gives strong hierarchy with warmth in
the running prose, and the mono carries prices, times and counts without extra
work. All three are on Google Fonts, so they load inside the CSP with nothing to
self-host.

**Cost:** three families rather than one. If the font payload becomes a
performance problem, subset them before dropping one.

### 2026-08-26 — Recipe table from day one
Drinks are composed of ingredients, not flat rows with a price. Costs about an
hour now. If inventory gets built later, it saves a migration that would
otherwise touch orders, menu and analytics at once. Cheap insurance on a fork
that is still open.

### 2026-08-28 — Operations layer: in
POS, inventory, and a live order queue are in scope, not deferred. Decided at
the trigger point named when this was first opened: Tier 00 complete, one
signature interaction (ambience + mixer) actually working, so the working
pace is no longer a guess.

**Consequence for schema work starting now:** `ingredients` gets a real stock
quantity column and the stock-deduction Postgres function (`SELECT ... FOR
UPDATE`, the race-condition guard CLAUDE.md calls out as the strongest single
backend talking point) is built as part of the initial migration, not bolted
on later. `recipes` already existed as a decision — this is what it was
insurance for.

### 2026-08-28 — Menu copy: full nine, voice settled
Full menu drafted in `supabase/seed-data/menu.ts`, ready for the seed script.
Four names/descriptions already existed in the mockups (Existential Espresso,
Monday Mocha, Cold Brew Contemplation, Oat Flat White) and stayed as-is; five
are new: 25th Hour, Chamomile for Later, Steamed Oat Milk, Triple Espresso,
Cinnamon Cortado.

**Voice, extracted from the four existing lines and matched going forward:**
one-word-to-few-word mood tag, drink name, one dry declarative sentence
(never more than ~12 words), no exclamation points, self-aware rather than
actually bleak.

**25th Hour was Paul's idea, not drafted** — a shot of espresso with a white
energy drink standing in for the milk. It's the drink the site's name was
originally going to riff on before "Depresso" was chosen, so it earns a
place on the menu as the outlier joke: priciest item ($6.50), mood tag
"Unwise", copy "Unlock the hidden 25th hour of the day with this unhinged
cup of coffee. Drink with absolute care."

**Deliberately mixed the category**, not all-coffee: added a tea (Chamomile
for Later) and a non-caffeinated steamer (Steamed Oat Milk) alongside five
coffee variations, for a menu that reads like a real shop's spread rather
than nine espresso permutations.

**Consequence:** two ingredients not in the original inventory sketch are
now needed — white energy drink (25th Hour) and chamomile tea bags
(Chamomile for Later) — both added to the ingredient list this seed data
assumes.

### 2026-08-28 — Seed data window: three months, not six
CLAUDE.md and the backlog both said "six months of seeded orders." That
number was never derived from anything else in the docs — it was an example
figure attached to the real requirement, which is rule 1 ("no empty states
on arrival"), not a specific duration. Three months still gives a believable
weekday/weekend curve and enough history for the analytics feature to show
real patterns, with meaningfully fewer rows to generate and store. Updated
both `CLAUDE.md` and `docs/BACKLOG.md` to say three months rather than
leaving the old figure stale next to a script that does something else.

### 2026-08-26 — No timeline
Worked on at Paul's own pace, in his own time. Dropped the four-week schedule
entirely; `docs/BACKLOG.md` now carries a dependency-ordered build order instead,
and sizes are relative to each other rather than to a calendar.

**Consequence:** the failure mode changes. A timed project fails by running late;
an untimed one fails by never converging, because there is always one more
feature. The replacement guardrail is a deliberate **feature freeze** before the
portfolio layer — everything currently working becomes the scope, everything else
goes to a v2 list. Without a calendar to force it, that has to be a decision made
on purpose.

### 2026-08-26 — No real payments
A simulated gateway is better here, not just easier: it lets us deliberately
trigger declines, timeouts and retries, so the project demonstrates error
handling rather than only the happy path.

### 2026-08-27 — Tier 01: time-of-day ambience + ambient sound mixer
Chosen over the persistent lofi player, animated café interior, mood-based
ordering, menu voice, and scroll-driven pour-over.

**Why:** ambience extends plumbing Tier 00 already built (`data-period`, the
switcher, the cross-fade) into hero art, copy and audio rather than starting
from zero — backlog calls it the single strongest differentiator. The mixer is
`M`-sized and, per the note below this used to be filed under, shares Web Audio
plumbing with the persistent player — building it first proves out the
gain-node/loop infrastructure before attempting the player's harder
state-persistence-plus-visualizer problem, if that becomes a third pick later.

**Deferred, not rejected:** persistent player (hardest frontend problem here,
better attempted with the mixer's audio plumbing already proven), animated
café interior (`L`, highest effort, better once there's momentum from two
finished things), mood-based ordering (`FS` — drags in backend/Tier 02 work
before Tier 01 is even settled), menu voice and scroll pour-over (smaller,
lower-ceiling, backlog already flags pour-over as the first cut if the list
runs long).

### 2026-08-27 — First contrast pass: two fixes to the Night Window tokens
Checked WCAG contrast for every ink/accent pair against `--ground` and
`--surface` in all four periods. Two pairs failed:

- `--on-accent` on `--accent` (button labels) — 3.93:1 in morning, 4.37:1 in
  afternoon, both under the 4.5:1 text threshold. Treated as a UI component
  (WCAG 1.4.11, 3:1) rather than body text, and given the 1.4.3 bold/large-text
  carve-out: primary-button labels are `font-weight: 700` (up from 500), which
  both clears 1.4.3's large-text exemption and 1.4.11's component threshold
  without touching the palette.
- `--ink-3` on `--surface` (the smallest text — mono labels, timestamps on
  cards) — 4.22:1 in dusk, 4.40:1 in late, just under 4.5:1. Nudged `--ink-3`
  lighter in both dark periods only (dusk `#8C99A3` → `#939FA9`, late `#78848D`
  → `#7E8992`) until each cleared 4.5:1 against `--surface` with a small margin.
  Barely perceptible; morning/afternoon `--ink-3` were already comfortably
  passing and are untouched.

**Consequence:** `CLAUDE.md`'s token table is updated to match — treat the
code and that table as the same source now, not `--ink-3`'s original values.
This was expected; see "Known traps" in `CLAUDE.md`, which called out
`--accent-text` as one instance of exactly this class of bug and predicted
more. Re-run the contrast check after any future token change, not just once.

### 2026-08-27 — Hero copy drops hardcoded rain and "corner table"
Drafted afternoon and late hero lines in `lib/domain/copy.ts` to match the
morning/dusk lines already in `docs/reference/homepage-*.html`, then on review
edited morning and dusk too: dropped "the rain stopped an hour ago" / "sit
with the rain for a while" (don't want weather asserted as fact in copy that
has no actual weather data behind it) and "take the corner table" (too
specific — not every layout will have one). The mockups still say the old
wording; treat `lib/domain/copy.ts` as the current source, not the HTML.

### 2026-08-27 — Hero art: authored in code (option 1)
Layered SVG built directly as a component, flat geometric shapes, fills wired
to the time-of-day tokens — same approach the mascot ended up using. Chosen
over hand-drawing in a vector editor and generate-then-trace.

**Why:** re-lights across all four periods for free, no external tooling or
licensing, and the mockups' window/lamp scene is already built this way as a
usable starting point (`docs/reference/homepage-dusk.html` /
`homepage-morning.html`). Building the mascot just proved out the whole
workflow — hand-plan proportions, verify with an overlay/screenshot loop
against a reference, keep it stroke- or fill-based with `--ink`/`--accent`
rather than hardcoded hex — so there's no new technique to learn here, just
applying it to the hero.

**One divergence from the mockups:** the mockups hand-pick a fully custom hex
palette per period for this scene (window colors, lamp glow, cup) — not the
documented token set, and not values that appear anywhere else in the design
system. The rebuilt hero uses only the existing tokens
(`--ground`/`--surface`/`--surface-2`/`--ink`/`--ink-2`/`--ink-3`/`--accent`/
`--cool`/`--line`/`--line-strong`/`--ok`), same as every other component, so
there's one palette to maintain instead of a second bespoke one just for the
hero. The lamp still visibly dims/warms across periods — via opacity and
`--accent` already varying per period — just without inventing new colors to
do it.

### 2026-08-29 — The cafe is in Iloilo City, not Perth
The hero copy and both reference mockups said "Perth" — a placeholder from
whoever built the original mockups, never an actual decision, and nothing
in `docs/DECISIONS.md` ever settled it. Caught while building analytics: the
seed script's "cafe hours" only make sense relative to a real timezone, and
Perth surfaced as the assumed one with no record of why. Changed to Iloilo
City, Philippines (UTC+8 — same numeric offset as Perth, so this isn't a
timezone change, just a correct city). Updated `components/hero-copy.tsx`
and both `docs/reference/homepage-*.html` mockups to match.

**Consequence:** found and fixed a real bug alongside this. The seed
generator built order timestamps using `Date`'s local-timezone methods
(`setHours`, `setDate`) and then serialized to UTC — so "6am–10pm cafe
hours" landed at whatever UTC hours the *host machine's* timezone happened
to produce, not the cafe's. `busiest_hours()` (new analytics function) is
what surfaced it: it showed real order volume at UTC hours that should have
been empty. Fixed in `supabase/seed-data/generate.ts` by doing the cafe's
UTC+8 offset arithmetic explicitly (`toCafeTimeUtc`) instead of going
through any local-timezone `Date` method — the generator now produces the
same output regardless of what timezone the machine running it is set to.
Regenerated `seed.sql` and re-ran `supabase db reset --linked`.

### 2026-08-31 — Back-navigation could silently overwrite the active period
Browser back-navigation from `/admin/login` to the homepage was restoring
"morning" instead of the visitor's actual last-picked period, only
self-correcting on a manual refresh. Root cause: Next's client-side router
cache can restore a page from an RSC payload rendered before a cookie
existed, so `PeriodSync`'s `hasCookie` prop and `PeriodProvider`'s `initial`
prop can both be stale on that render — `PeriodSync` then re-ran
auto-detection and overwrote the real cookie, and `<html data-period>`
stayed wherever `/admin`'s `ForceDusk` had left it since the DOM-write
effect only re-ran when React state changed, which it hadn't.

**Fix:** both components now resolve the *actual* cookie value themselves
(`document.cookie`) on mount rather than trusting the prop, so a stale
router-cache render can no longer clobber a real cookie or leave a stale
`data-period` behind. Verified via Playwright: manual period pick → visit
`/admin/login` → browser back (and the login page's own back link) both
restore the exact prior period immediately, no refresh needed.

### 2026-08-31 — Simulation mode: order creation, closing the inventory loop
The inventory/recipe backend (schema, derived sold-out state in `getMenu()`,
the race-safe `deduct_stock_for_order` function) already existed from the
initial schema, but nothing ever called it — orders are always created
already at `"received"`, and there was no order-creation path at all, so the
function was dead code. Rather than building the full order-ahead flow
(cart, checkout, fake payment) to close that gap, built simulation mode
instead: a toggle on `/admin/orders` that places and advances fake orders
every few seconds against whatever's actually orderable, calling
`deduct_stock_for_order` for real. Smaller than order-ahead (`S` vs `L` in
the backlog) and it's the piece actually missing — a customer-facing
ordering UI is separate scope.

**Design:** `lib/domain/simulation.ts` picks a random available menu item
respecting the same `isSoldOut`/`outOfStock` rule the public menu uses, so
simulation can never "order" something a real visitor couldn't. `lib/db/orders.ts`
gained `placeOrder()` (insert + RPC, rolls back to `cancelled` if stock ran
out) and `advanceRandomActiveOrder()`. A client-side interval
(`SimulationController`) drives `/api/simulation/tick`, weighted 40% toward
placing a new order and 60% toward advancing an existing one so the queue
doesn't grow unbounded over a long demo session. Runs only while the tab
with the toggle is open — no background job or cron, consistent with this
being a demo control rather than production infrastructure.

**Visual feedback, deliberately both:** the existing `OrderQueue` table
animates in new rows (CSS-only — a freshly mounted DOM node plays
`animate-row-in`; existing rows are untouched since React reconciles by
`key`), and a new `ActivityFeed` corner ticker logs each tick's event in
plain language. Considered picking one; both were cheap once polling
existed and prove the same real data two ways — the table for "is this
real," the feed for "what just happened" without reading a table.

**Auth:** `/api/simulation/tick` mutates real orders and stock, so it needed
the same session gate as the rest of `/admin` — extended the proxy matcher
to include `/api/simulation/:path*`, and added an API-aware branch (401 JSON
instead of a login-page redirect) since the existing redirect behavior is
wrong for a `fetch()` caller.

### 2026-08-31 — Reset demo data: hidden page, not a shared-nav button
Backlog's "Demo reset" item (`FS` `S`) assumed something like
`supabase db reset`, which needs the CLI/Docker and can't run from a
deployed server action. Built `resetDemoData()` instead: truncates
`orders`/`order_items`/`recipe_items`/`menu_items`/`ingredients` and
re-inserts from the same typed seed data (`supabase/seed-data/*.ts`),
including a freshly generated ~90 days of order history — extracted the
order-generation algorithm out of `supabase/seed-data/generate.ts` into
`lib/domain/seed-generation.ts` so the build-time script and the runtime
reset action share one implementation instead of two copies drifting apart.
Runtime reset seeds the generator from `Date.now()` (a different plausible
history each time) where the build-time script keeps a fixed seed
(reproducible diffs when regenerating `seed.sql`). Batches inserts (500 rows
per call) rather than one row per request — naive one-by-one would be
thousands of round trips for ~1500 orders.

**Why hidden, not next to the simulation toggle as first proposed:** there
is one shared database behind the whole demo (no multi-tenancy, per
CLAUDE.md's non-goals) — Reset wipes and regenerates orders/stock for
*everyone* currently on the site, not a per-visitor copy. That's an accepted
tradeoff for existing admin actions too (toggling sold-out, adjusting
stock), but Reset is the most visible/destructive version of it. Rather than
solve that with a warning label next to a button any reviewer with the demo
password could press, moved it to `/admin/reset` — same session gate as the
rest of `/admin`, but not linked from `AdminNav`, so it's reachable only by
typing the URL. Still has an in-page confirm step (not a native `confirm()`,
which doesn't fit the design system) since it's destructive even if only the
owner can reach it.

### 2026-08-31 — Orders page splits into a queue half and a pickup-board half
`/admin/orders` was a single list with per-order controls (Cancel, advance).
Added a second, controls-free panel (`PickupBoard`) next to it — the
"screen above the counter" idea from the proposed operations layer, scoped
down to fit inside the existing admin page rather than becoming its own
route. Groups active orders into two columns: "In progress" (received +
brewing collapsed together — a waiting customer doesn't distinguish the
sub-stage) and "Ready for pickup." Carries the mascot + wordmark in its own
header so it reads as a distinct display surface, not another admin table.

**No separate "erase" logic needed:** both halves render the same `orders`
array `SimulationController` already owns as the single source of truth.
Clicking "Complete" on the queue side calls the existing `advanceOrder`
action, which moves the order out of the active statuses `getActiveOrders()`
returns — the next refresh drops it from both panels simultaneously, for
free, since there was never a second copy of the list to keep in sync.

### 2026-08-31 — Audio sourced from Pixabay
All four ambient mixer tracks (`public/audio/rain.mp3`, `chatter.mp3`,
`vinyl.mp3`, `espresso.mp3`) are sourced from Pixabay. Pixabay's content
license is free for commercial and non-commercial use with no attribution
legally required — same practical effect as CC0 for this project's
purposes, satisfying the "CC0 or properly licensed" bar in `CLAUDE.md`.
Individual track pages/creator credits weren't kept at download time; not
worth re-tracking down after the fact given Pixabay's license doesn't
require it, but if the eventual README grows a credits section, crediting
"Pixabay" as the source is enough to be honest about where the audio came
from without needing per-track attribution.

**Consequence:** closes the "where does the audio come from" open question
from Tier 01 — the files were already in place and wired into
`lib/domain/ambience.ts` with sensible default levels, this was purely a
documentation gap, not a missing feature.

### 2026-09-01 — Persistent lofi player: the deferred Tier 01 pick, built
Picked up the persistent player deferred in the original Tier 01 decision
(chosen against in favor of ambient ambience + mixer, "if that becomes a
third pick later" — see the 2026-08-27 entry). The mixer's Web Audio
plumbing (manual `AudioContext`, gain nodes, lazy-create-on-first-gesture)
carried over directly; the player adds an `AnalyserNode` for a real
frequency-driven visualizer and uses an `HTMLAudioElement` as the source
(rather than useAmbience's fetch-and-decode `AudioBufferSourceNode`)
because the player needs genuine seek/duration/currentTime, which an
element gives for free and a raw buffer source does not.

**Bar row doubles as visualizer and scrubber**, matching both the mockup
and a reverse-engineered read of a similar Framer marketplace component:
one row of bars, heights driven by `getByteFrequencyData` while playing,
click/drag anywhere to seek — not a separate waveform plus a separate
progress line. Track title/artist/skip controls (next/previous through a
small placeholder `PLAYLIST` in `lib/domain/playlist.ts`) were added beyond
what that reference component itself shows.

**Placement:** originally a `fixed` bar spanning the viewport bottom, then
moved into a proper `SiteFooter` (branding + the CLAUDE.md rule-4 demo
badge on the left, player docked right) as a normal in-flow element —
scrolls away like an ordinary footer rather than permanently occupying
screen space. Mounted in `app/(site)/layout.tsx`, deliberately excluded
from `/admin`, same reasoning as `ForceDusk` keeping the live period system
out of the admin section: the `<audio>` element and its `AudioContext`
graph need to survive navigation between public pages, and shouldn't bleed
into a section meant to be isolated from the public site's live systems.

**Real tracks not sourced yet** — `lib/domain/playlist.ts` currently points
at two generated placeholder tones (`public/audio/lofi/placeholder-*.wav`)
so the full mechanism (play/pause/seek/visualizer/persistence) could be
built and verified end-to-end. Swapping in real, properly licensed tracks
later is a one-file edit; nothing else in the player needs to change.

**Two real bugs caught building this, both fixed:**
- Percentage `height` on the bar `<span>`s resolved to `0` once the bars'
  container sat inside a `flex-col` parent using `flex-1` — the same class
  of bug the analytics hourly chart hit earlier (`docs/DECISIONS.md`,
  analytics chart entry): a percentage height needs an ancestor with a
  *resolved* height, and `flex-1`'s `flex-basis: 0%` starves that chain
  before anything defines one. Fixed by giving the bar row `w-full
  flex-none` instead of `flex-1` and letting the explicit `h-*` utility
  actually apply.
- Seeking always jumped to `0:00` regardless of where the bar was clicked.
  Root cause: `<audio src={track.src}>` starts fetching as soon as it
  mounts, and for a small local file the browser can fire `loadedmetadata`
  before React finishes attaching that event handler — the event is missed
  entirely and `duration` state stays `0` forever, so `seek(fraction *
  duration)` always computed a target of `0`. Fixed by also reading
  `audio.duration` directly off the DOM node in an effect
  (`components/use-player.ts`) as a backstop that isn't subject to the same
  event-timing race.

### 2026-09-01 — Real player tracks; visualizer needed a log-frequency remap
Swapped the two placeholder tones in `lib/domain/playlist.ts` for five real
tracks (Chill Pulse — "Talk", Pufino — "Charmed" and "Fantasy", massobeats
— "Aromatic" and "Peach Prosecco"), sourced from
[Free To Use](https://freetouse.com/music). File names contain spaces
(`"Artist - Title.mp3"`); `src` values are run through `encodeURI` so they
resolve correctly.

**Licensing note, not fully clean-cut.** Free To Use's free-tier
attribution license explicitly covers video platforms (YouTube, TikTok,
Instagram, Facebook, Twitch); its FAQ separately states that "other website
content" — which is what this is — needs a Commercial Plan subscription or
a single-track license instead of just attribution. Decision made to keep
these tracks and use them anyway, accepting that ambiguity, rather than
switching to Pixabay (the ambient mixer's source, confirmed clear for this
use). A dedicated "Built using" credits page is planned to list this
alongside every other dependency/asset source — deliberately not folded
into the site footer, so credits live in one place rather than scattered
per-component.

**The visualizer needed real tuning, not just real audio.** Once actual
music was playing, the bars were visibly wrong: tall at the very start of
the row, flat everywhere else, barely moving with the beat. Root cause:
`getByteFrequencyData` returns linearly-spaced frequency bins, but music
energy — especially lofi's — is concentrated in the bass/low-mid, so a 1:1
or evenly-split bin-to-bar mapping put nearly all the audible signal into
the first few bars and left the rest starved. Fixed in two steps, verified
by sampling actual bar heights across frames during real playback rather
than eyeballing it:
1. `frequencyBinsToBars()` (`components/use-player.ts`) maps bars using an
   exponentially-widening bin range per bar (narrow at the low end, wide at
   the high end — roughly one octave per step), the standard technique real
   spectrum visualizers use instead of linear bin-per-bar.
2. Even with exponential spacing, the *last several* bars still sat
   permanently pinned at the floor with zero frame-to-frame variance —
   correct given these tracks have almost no energy above roughly a third
   of the full FFT range, but it read as "not reacting." Capped the mapped
   range to the bottom ~22% of bins (`FREQUENCY_BIN_FRACTION`) and dropped
   the bar count from 24 to 16, so every visible bar sits inside the part
   of the spectrum that's actually alive for this style of music, rather
   than reserving visual space for a range that's reliably silent.

### 2026-09-02 — Case study and credits combined into one page
Built `/case-study` as a single page covering both the Tier 03 "case study"
item and the "Built using" credits item — not two separate pages. Follows
CLAUDE.md's own guidance for this page ("three decisions with tradeoffs",
not a features list, since a features list just restates what a reviewer
already sees by using the site) rather than defaulting to something
simpler to write. Content pulled directly from real decisions already
recorded here rather than invented: the stock-deduction race-condition
guard, the time-of-day system, and a genuine debugging story (the
visualizer's frequency-mapping fix — see the 2026-09-01 entry above).
Linked from the homepage header next to Admin, satisfying the "two clicks
to anything" demo rule.

A "what I'd do differently" section (covering the Free To Use licensing
ambiguity and two bugs caught by specifically checking for them) was
drafted and then cut on review — decided the page reads better without it
for now.

**Consequence:** closes the "Built using" credits page open item — folded
into this page's own "Built using" section rather than shipping separately,
per the explicit request to combine them. `lib/domain/playlist.ts`'s own
doc comment was also corrected here — it previously said the player tracks
came from Pixabay, which was wrong; that's the ambient mixer's source, the
player's tracks are from Free To Use.

### 2026-09-02 — Afternoon retuned: warm/golden instead of a cool-palette variant
User feedback: afternoon was barely distinguishable from morning. Checked —
correct: every token differed from morning by only a handful of hex digits
(`--ground` `#E7EAEC` vs `#DFE4E7`, an ~8-value RGB nudge), which defeated
the point of the time-of-day system entirely for that one period.

Two brightness-based fixes were tried and screenshotted against morning
first (brighter/flatter, and cooler/greyer) — both were rejected as still
too close to morning, even the one with passing "dramatic difference"
framing. The fix that actually worked was changing axis, not degree: a
warm/golden cast (afternoon sun through the window) rather than a
brightness or saturation tweak. `--ground`/`--surface` themselves carry a
visible amber tint now, not just `--accent`.

**Consequence — this bends the palette's own stated rule.** Night Window's
documented concept (`CLAUDE.md`) is a cool ground with one warm light
source; a warm-toned ground for afternoon is a real departure from that,
flagged explicitly and kept anyway on request, because the whole point was
a *dramatic, unmistakable* shift and the on-concept options didn't deliver
one. Re-verified WCAG contrast for every pair after the change (`ink`/
`ink-2`/`ink-3`/`accent-text` against `ground`/`surface`, plus `on-accent`
on `accent` against the 3:1 large-text/bold floor CLAUDE.md's own
`--accent-text` workaround relies on) — all clear with margins comparable
to the other three periods. `CLAUDE.md`'s token table updated to match;
treat the code as source, per its own instruction.

### 2026-09-02 — First-visit auto-detect could get stomped back to dusk
User report: opened the site in a fresh incognito window at 2am local time,
landed on dusk instead of late; a manual refresh then correctly showed
late. Root cause was a mount-order race between two sibling components,
not the auto-detection logic itself (which was already correct).

`PeriodSync` (child, so its effect runs first) detects the real period from
the visitor's clock and calls `setPeriod` synchronously — but its cookie
write is an async `fetch()` POST that hasn't resolved by the time the next
effect runs. `PeriodProvider`'s own mount effect (added to fix the earlier
back-navigation bug — see the 2026-08-31 entry) then re-read
`document.cookie`, found nothing yet, and fell back to `initial` (the SSR
default, always `"dusk"` when no cookie exists) — silently overwriting the
just-corrected value before the visitor ever saw it settle.

**Fix:** `PeriodProvider`'s correction effect now returns early when there's
no cookie at all, instead of falling back to `initial` in that case. No
cookie means there's nothing to "correct back to" — `PeriodSync` is the
sole authority for that scenario. The effect still corrects from a real
cookie on every mount (the back-navigation case it was built for), just no
longer treats "no cookie yet" as equivalent to "cookie says dusk."

Verified with Playwright: forced the browser clock to 2am with a fresh
(cookie-less) context, sampled `data-period` across the first ~1.2s of a
real page load — one unavoidable `dusk` frame during SSR-to-hydration,
then settles to `late` and stays there, cookie correctly set. Re-verified
the original back-navigation fix (manual override survives browser back)
still holds after this change.

---

## Open

### Which second backend loop?
**Resolved by what shipped, not by a fresh decision.** The admin dashboard
(mandatory) plus inventory/recipes, simulation mode, and demo reset all
landed — the "second loop" question is answered in practice, just never
formally closed here. Leaving this entry as a pointer rather than deleting
it, since it's the historical record of why those got picked.

### Pending work snapshot — 2026-09-02
Recorded on request, session paused here. Not urgent, just a clean
re-entry point.

**Small, self-contained:**
- Global spacebar play/pause shortcut for the persistent player — only the
  focused scrubber's arrow-key seek exists today (`components/player-bars.tsx`).

**Sizeable, unbuilt operations-layer pieces** (from the "Proposed" section
above):
- Order queue display — a read-only front-of-house screen, distinct from
  `/admin/orders`'s barista-facing advance/cancel controls.
- Staff POS — the last big piece, `L`-sized, a deliberately dense/fast
  second design language.

**Unpicked Tier 02 items** (optional — already well past "pick two or
three" with what's built): loyalty stamp card, corkboard guestbook.

**Tier 03, gated behind a feature freeze:** dev-mode overlay,
performance & a11y report, README.

### When to freeze?
**Trigger: not answerable yet — but hold onto it.** Worth actively
considering now, given how much of Tier 00–02 and the operations layer is
done — see the pending-work snapshot above for what freezing would mean
deferring.

The moment you catch yourself adding a feature instead of finishing one,
that's the answer.
