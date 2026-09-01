# Depresso — Feature Backlog

Working document, not a specification. Expect it to change as features get
picked, cut and re-scoped — including during development, once real code makes
an estimate or an assumption here look wrong.

**Legend** — `FE` frontend only · `BE` backend only · `FS` both halves
**Relative size** — `S` an evening or two · `M` a handful of sessions · `L` a sustained stretch

Sizes are relative to each other, not to a calendar. There is no deadline on this project.

---

## Tier 00 — Foundation

Not glamorous, not optional. Everything downstream reads from these. **Build all four.**

| Feature | Tags | Notes |
|---|---|---|
| Design tokens & type system | `FE` `S` | Palette (**Night Window**) and type (**Bricolage Grotesque / Newsreader / DM Mono**) are settled — full token set in `CLAUDE.md`. Still to define: spacing scale, radii, motion durations. Do this before the first component or you'll refactor the whole site later. |
| Time-of-day engine | `FE` `M` | Reads the visitor's local clock, resolves to morning / afternoon / dusk / late, exposes it on `<html data-period>`. **Ship a manual override in the header** so a reviewer sees all four in ten seconds instead of returning at 3am. |
| Motion system | `FE` `S` | Shared easings and durations, plus a `prefers-reduced-motion` path that degrades to a quieter version rather than switching everything off. |
| Accessibility baseline | `FE` `M` | Contrast verified in all four periods, visible focus rings, keyboard-operable player and mixer, skip link, semantic landmarks. Dim palettes are where lofi sites fail — passing anyway is the differentiator. |

---

## Tier 01 — Frontend signature

The one mechanic that makes someone send the link to a friend. **Pick two, three at most.**

| Feature | Tags | Notes |
|---|---|---|
| Time-of-day ambience | `FE` `L` | Palette, hero art, ambient audio and copy all shift with the clock. Late night drops the lights and changes the greeting to *still up?* **Strongest single differentiator** — it makes the site feel like it exists in time rather than having been authored once. |
| Persistent lofi player | `FE` `L` | ✅ **Mostly done.** Survives route changes (mounted in `SiteFooter`, excluded from `/admin`), five real tracks from Free To Use, visualizer driven by real Web Audio frequency data (log-scaled to the range this music actually occupies — see `docs/DECISIONS.md`), remembers volume and last track. Track/artist metadata, next/previous, seek-by-click all built. **Not yet:** a global spacebar play/pause shortcut (only the focused scrubber's arrow-key seek exists so far) and the "Built using" credits page (also open in `docs/DECISIONS.md`) covering the track attribution. |
| Ambient sound mixer | `FE` `M` | ✅ **Done.** Independent loops for rain, chatter, vinyl crackle, espresso hiss, each on its own gain node with a slider, mix persisted via `localStorage`. Tracks sourced from Pixabay (see `docs/DECISIONS.md`). |
| Animated café interior | `FE` `L` | Hand-made scene with parallax depth, drifting steam, rain on the window, a cat that shifts occasionally. Highest effort, highest "who made this" reaction. Layered SVG or canvas — a stock photo undoes the whole effect. |
| Mood-based ordering | `FS` `M` | "How are you feeling?" → a drink. Fits the name so well it feels inevitable. Store the mapping server-side so the admin can edit it. |
| A menu with a voice | `FE` `S` | Existential Espresso. Monday Mocha. Cold Brew Contemplation. Copy is the cheapest differentiator you'll ever ship — write it once and every screenshot improves. |
| Scroll-driven pour-over | `FE` `M` | Coffee fills the cup as you scroll. Lovely, and **the first thing to cut** when the list starts feeling long. |

---

## Tier 02 — Backend, made visible

The failure mode of fullstack portfolio projects is a backend nobody can see. Every
item here is chosen because a reviewer can watch the loop close in ten seconds.
**Pick two or three, plus the seed script.**

| Feature | Tags | Notes |
|---|---|---|
| The seed script | `BE` `M` | ✅ **Done.** Three months of orders with plausible names, realistic timestamps, believable weekday/weekend curve. Lives in `supabase/seed.sql` so `db reset` restores it — plus a runtime reset action (`/admin/reset`) sharing the same generator. |
| Admin dashboard | `FS` `L` | ✅ **Done.** CRUD the menu, toggle sold out, watch orders arrive. Admin in one tab, public site in another, flip a drink, watch it grey out. |
| Order-ahead flow | `FS` `L` | Cart → simulated checkout → status timeline that auto-advances. Skipping real payments is an *advantage*: a fake gateway lets you trigger declines, timeouts and retries, so you demonstrate error handling. **Not built** — simulation mode (below) closed the order-creation gap without needing the customer-facing cart/checkout UI this implies. |
| Loyalty stamp card | `FS` `M` | Auth, persistence and a small rule engine in a very small surface area — a good first backend feature. Seed the demo account at 7 of 10 stamps so the reward is three clicks away. |
| Track request queue | `FS` `L` | Visitors upvote what plays next, live. **Superseded** — the order queue (built) uses the same plumbing, is more relevant, and needed no music licensing. |
| Corkboard guestbook | `FS` `M` | Notes pinned to a board. CRUD plus rate limiting plus a moderation queue in the admin. Small feature, but **"I thought about abuse" is a senior signal** that almost no junior portfolio shows. |
| Shop analytics | `FS` `M` | ✅ **Done.** Most-ordered drink, busiest hour, weekly volume — computed in SQL from the seeded orders. |

---

## Proposed — The operations layer

> **Status: undecided.** Revisit once Tier 00 is done and one signature interaction
> actually works. Nothing in Tier 00 changes either way, so deferring costs nothing.

Not three features but one: the staff-facing half of the business. Changes what the
project claims to be — from *a coffee shop website* to *a coffee shop system* — and
roughly doubles the backend.

| Feature | Tags | Notes |
|---|---|---|
| Inventory & recipes | `FS` `L` | ✅ **Done.** Drinks composed of ingredients, so an order deducts against a recipe (via `deduct_stock_for_order`, `SELECT ... FOR UPDATE`) and stock hitting zero auto-disables the item. Admin sold-out toggle is a manual override on top of this derived state, not instead of it. |
| Order queue display | `FS` `M` | The screen above the counter: waiting, in progress, ready. Essentially a read-only realtime view — **cheap on Supabase Realtime** — and the most visually satisfying surface in the system. The admin `/admin/orders` queue exists but is barista-facing (advance/cancel controls), not this read-only front-of-house display — still open. |
| Staff POS | `FS` `L` | One screen: grid of drinks, tap to add, tap to charge, order drops into the queue. A second design language — dense, fast, large touch targets — deliberately opposite to the lofi site. **That contrast is the point:** few portfolios show design for someone using a tool eight hours a day. One screen ≈ four days; "a real POS" eats the month. |
| Simulation mode | `FS` `S` | ✅ **Done**, on `/admin/orders`. A toggle spawning fake customers ordering every few seconds against real menu items — real stock deduction, real race-condition guard. Queue table animates in new/changed rows; a corner activity feed logs each event in plain language. Runs client-side while the tab is open, no background job. |

**Why it might be worth the cost.** Four tabs open: customer site, POS, barista queue,
admin dashboard. Ring up an oat flat white on the POS — the ticket appears on the
queue, the stock counter drops on the dashboard, oat milk goes sold-out on the public
menu. Thirty seconds, no code reading, entire fullstack claim proven.

---

## Tier 03 — The portfolio layer

Least fun, highest return per hour. **Do not skip.** A polished project with no case
study loses to a plainer one that explains itself.

| Feature | Tags | Notes |
|---|---|---|
| Case study page | `M` | Problem, constraints, three decisions with tradeoffs, what you'd do differently. Hiring managers read this more carefully than the code — it's the only place they see how you think. |
| Dev-mode overlay | `FE` `M` | A hidden toggle annotating the live UI with what's underneath: which component, which endpoint, which query. Nerdy, memorable, and it forces you to genuinely understand your own architecture. |
| Demo reset | `FS` `S` | ✅ **Done**, at `/admin/reset` — not linked from the admin nav (see `docs/DECISIONS.md`: it's a shared-database action, kept off the surface any reviewer with the demo password could reach). One button restores seed state, freshly regenerated rather than replaying the exact same rows every time. |
| Performance & a11y report | `S` | Lighthouse numbers and an axe pass in the README with real figures, not a badge. And if the numbers are bad you learn it before an interviewer does. |
| README that respects the reader | `S` | What it is, how to run it, architecture in one diagram, honest limitations section. The limitations section is what makes the rest believable. |

---

## Build order

No dates — this is a dependency chain, not a schedule. Only the order matters.

| Phase | Focus |
|---|---|
| 01 — Foundation & face | Tokens, type, time-of-day engine, motion, accessibility baseline, hero, static menu. **Deploy the moment there's a page worth loading.** Start audio sourcing here and let it run in the background. |
| 02 — Signature | The chosen interactions, built properly. **Ops-layer fork gets decided at the end of this phase.** |
| 03 — Backend | Schema, seed script, API, admin, one order loop end to end. |
| 04 — Finish it | Feature freeze first. Then analytics, case study, a11y pass, performance, README. |

### The rule that replaces the deadline

An untimed project doesn't fail by running late — it fails by never converging,
because there is always one more feature worth adding. So the freeze has to be a
decision made on purpose rather than one a calendar makes for you: pick a moment,
declare everything currently working to be the scope, and move the rest to a v2
list. A finished small thing is a portfolio piece. An unfinished ambitious one
is not.
