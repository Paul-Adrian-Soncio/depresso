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
| Persistent lofi player | `FE` `L` | Survives route changes, visualizer driven by real Web Audio frequency data, keyboard shortcuts, remembers volume and position. Quietly the hardest frontend problem here — forces app-level state and persistent layout. |
| Ambient sound mixer | `FE` `M` | Independent loops for rain, chatter, vinyl crackle, espresso hiss, each on its own gain node with a slider. Save a named mix. Cheap to build, disproportionately memorable. |
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
| The seed script | `BE` `M` | Three months of orders with plausible names, realistic timestamps, believable weekday/weekend curve. Lives in `supabase/seed.sql` so `db reset` restores it. **Build early — it's what makes every other backend feature look real**, and almost everyone skips it. |
| Admin dashboard | `FS` `L` | CRUD the menu, toggle sold out, watch orders arrive. Admin in one tab, public site in another, flip a drink, watch it grey out. **The clearest possible proof you built both halves**, no code reading required. |
| Order-ahead flow | `FS` `L` | Cart → simulated checkout → status timeline that auto-advances. Skipping real payments is an *advantage*: a fake gateway lets you trigger declines, timeouts and retries, so you demonstrate error handling. |
| Loyalty stamp card | `FS` `M` | Auth, persistence and a small rule engine in a very small surface area — a good first backend feature. Seed the demo account at 7 of 10 stamps so the reward is three clicks away. |
| Track request queue | `FS` `L` | Visitors upvote what plays next, live. **Possibly superseded** — if the operations layer goes ahead, the order queue uses the same plumbing, is more relevant, and needs no music licensing. |
| Corkboard guestbook | `FS` `M` | Notes pinned to a board. CRUD plus rate limiting plus a moderation queue in the admin. Small feature, but **"I thought about abuse" is a senior signal** that almost no junior portfolio shows. |
| Shop analytics | `FS` `M` | Most-ordered drink, busiest hour, weekly volume — computed in SQL from the seeded orders. Pure payoff from the seed script, and it gives the admin dashboard something worth looking at. |

---

## Proposed — The operations layer

> **Status: undecided.** Revisit once Tier 00 is done and one signature interaction
> actually works. Nothing in Tier 00 changes either way, so deferring costs nothing.

Not three features but one: the staff-facing half of the business. Changes what the
project claims to be — from *a coffee shop website* to *a coffee shop system* — and
roughly doubles the backend.

| Feature | Tags | Notes |
|---|---|---|
| Inventory & recipes | `FS` `L` | **The strongest single addition available.** Drinks composed of ingredients, so an order deducts against a recipe and stock hitting zero auto-disables the item. The only feature producing real domain logic rather than CRUD: joins, transactions, and a genuine race condition on the last unit. Upgrades the admin sold-out toggle from a manual switch into derived state. |
| Order queue display | `FS` `M` | The screen above the counter: waiting, in progress, ready. Essentially a read-only realtime view — **cheap on Supabase Realtime** — and the most visually satisfying surface in the system. |
| Staff POS | `FS` `L` | One screen: grid of drinks, tap to add, tap to charge, order drops into the queue. A second design language — dense, fast, large touch targets — deliberately opposite to the lofi site. **That contrast is the point:** few portfolios show design for someone using a tool eight hours a day. One screen ≈ four days; "a real POS" eats the month. |
| Simulation mode | `FS` `S` | A toggle spawning fake customers ordering every few seconds, so the POS and queue are alive the moment a reviewer opens them. Rule 1 applied to the surfaces that need it most. |

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
| Demo reset | `FS` `S` | One button restores seed state. Also saves you in a live interview after someone has marked the whole menu sold out. |
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
