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

### Which two signature interactions?
**Trigger: before starting Tier 01.**

All of Tier 01 depends on this. The persistent player and the ambient mixer
share plumbing, so choosing both is cheaper than it looks.

### Hero art direction
**Trigger: when building the hero. Recorded as options, nothing locked.**

The constraint that governs all three paths: whatever gets made has to be
**re-lit four times**, so the output must be vector with token-driven fills. A
flat raster image cannot do this — which is why path 3 below ends in a trace
rather than an image.

**1. Authored in code.** Layered SVG plus CSS and canvas, written directly as a
component — flat geometric shapes, fills wired to the time-of-day tokens. Themes
across all four periods for free, no external tooling, nothing to license. The
scene in the identity canvas is already this.

**2. Hand-drawn in a vector editor.** Inkscape (free), or Boxy SVG / Penpot /
Figma's free tier. Export, run through SVGO to strip editor metadata, hand-edit
fills to token variables. Same end result with more authorship; two to four
evenings, and the style has to stay flat and geometric or it reads amateur.

**3. Generated, then traced.** Generate a reference image with a free tool, trace
to vector (Inkscape's Trace Bitmap or `vtracer`), clean up the paths, wire the
fills. Fast to a first look, slow to something usable — auto-traces produce
hundreds of junk paths, and cleanup often takes as long as drawing would have.
Two risks: some reviewers react badly to AI art in a portfolio, and generated
hero art is currently a marker of low-effort ones. If used, say so in the
README's limitations section rather than leaving reviewers to wonder.

A hybrid of 2 and 3 — generate only for thumbnails and composition, then draw it
yourself — sidesteps the blank page while keeping authorship.

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
