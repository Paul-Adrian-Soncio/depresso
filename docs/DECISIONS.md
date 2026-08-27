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

---

## Open

### Operations layer — in or out?
**Trigger: Tier 00 complete and one signature interaction actually working.**

POS, inventory, and a live order queue. Deliberately deferred until the
groundwork is real and the actual working pace is known — that pace is the only
input that matters, and it can't be guessed in advance. Tier 00 is identical
either way, so nothing is blocked meanwhile.

It roughly doubles the backend, so the honest tradeoff is fewer frontend
features or a considerably longer project. Supabase Realtime has made it cheaper
than first estimated, so revisit the numbers rather than the original gut call.

### Menu copy and brand voice
**Trigger: before the menu gets built.**

Drink names and descriptions are drafted only as far as the mockups needed —
Existential Espresso, Monday Mocha, Cold Brew Contemplation, Oat Flat White. The
full menu of nine, the mood tags, and the site's wider voice are unwritten. Copy
is the cheapest differentiator available here, so it deserves a real pass rather
than being filled in while building components.

### Where does the audio come from?
**Trigger: start during Phase 01, in the background.**

Needs CC0 or properly licensed lofi tracks and ambient loops. Sourcing,
trimming and clean looping takes longer than expected — the most commonly
underestimated item on the whole plan.

### Which second backend loop?
**Trigger: start of Phase 03.**

The admin dashboard is close to mandatory — it's the clearest proof. The second
is a real choice, and partly depends on the operations-layer fork.

### When to freeze?
**Trigger: not answerable yet — but hold onto it.**

The moment you catch yourself adding a feature instead of finishing one, that's
the answer.
