# Depresso

A lofi coffee shop that only exists on the internet. Portfolio project for Paul,
a frontend developer moving to fullstack.

**This is a simulation, not a real business.** There are no real customers, no
real money, no real espresso. Every table is seeded. That constraint is a design
brief, not something to hide — see the demo rules below.

**Who it is for:** hiring managers and engineers reviewing a portfolio. Every
decision should be legible to someone spending five minutes on the site and
maybe ten on the repo.

**Current state:** planning complete, nothing built yet. First task is scaffolding
the Next.js app and Tier 00 of `docs/BACKLOG.md`. Open decisions are in
`docs/DECISIONS.md` — check it before proposing anything from the "Proposed"
section of the backlog.

> **These documents are working drafts, not specifications.** Every part of them
> — features, tokens, structure, conventions — is expected to change during
> development. When reality and a document disagree, say so and update the
> document; do not bend the code to match a stale plan.

---

## Stack

- **Next.js** (App Router, TypeScript, strict mode)
- **Tailwind CSS** for styling
- **Lucide** for icons
- **Supabase** — Postgres, Auth, Realtime, Storage
- Deployed to a live URL from week one

---

## Design system

Palette is **Night Window** — a cool ground with one warm light source. The four
periods move the light rather than repainting the room, so the site reads as one
place across a day.

Define these as CSS custom properties and swap the set on `<html data-period>`.
Tailwind references the variables; do **not** build four parallel Tailwind color
scales.

```css
:root, [data-period="morning"] {
  --ground: #E7EAEC;  --surface: #F3F5F6;  --surface-2: #E1E5E7;
  --ink: #1E2429;     --ink-2: #4C575F;    --ink-3: #58636B;
  --accent: #B26A20;  --accent-text: #8A5114;  --on-accent: #FBF6EF;
  --cool: #4A6E7E;    --line: #D6DCDF;     --line-strong: #B9C2C8;
  --ok: #4E7F5B;
}
[data-period="afternoon"] {
  --ground: #DFE4E7;  --surface: #EEF1F3;  --surface-2: #D9DFE2;
  --ink: #1B2126;     --ink-2: #47525A;    --ink-3: #525C64;
  --accent: #A8631D;  --accent-text: #834C12;  --on-accent: #FBF6EF;
  --cool: #436674;    --line: #CED5D9;     --line-strong: #B2BCC2;
  --ok: #487754;
}
[data-period="dusk"] {
  --ground: #232C33;  --surface: #2C363E;  --surface-2: #29323A;
  --ink: #E2E8EC;     --ink-2: #B4BEC6;    --ink-3: #939FA9;
  --accent: #E3903F;  --accent-text: #E3903F;  --on-accent: #1B2126;
  --cool: #6E9AAC;    --line: #313C45;     --line-strong: #46525C;
  --ok: #7FB08A;
}
[data-period="late"] {
  --ground: #10161B;  --surface: #171E24;  --surface-2: #141A20;
  --ink: #D9E1E6;     --ink-2: #A3AFB7;    --ink-3: #7E8992;
  --accent: #F0A24E;  --accent-text: #F0A24E;  --on-accent: #14100A;
  --cool: #5F8B9C;    --line: #202932;     --line-strong: #33404A;
  --ok: #74A67F;
}
```

**Why `--accent-text` exists.** On the two light periods the accent is not
readable enough as small text against the ground, so accent-colored *text* uses
the darker variant while fills, buttons and indicators use `--accent`. On the
dark periods they are the same value. Do not collapse them.

### Type

- `--font-display`: **Bricolage Grotesque**, fallback `'Trebuchet MS', sans-serif`
- `--font-body`: **Newsreader**, fallback `Georgia, 'Times New Roman', serif`
- `--font-mono`: **DM Mono**, fallback `ui-monospace, Menlo, monospace`

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,700&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=DM+Mono:wght@400;500&display=swap">
```

Usage:

- **Display** — headings, buttons, nav, anything structural. Tighten tracking as
  size grows: roughly `-0.02em` at 20px, `-0.04em` at 64px.
- **Body** — running prose and menu descriptions only. Not for UI chrome.
- **Mono** — labels, eyebrows, prices, times, counts, any tabular data. Uppercase
  with `0.10–0.16em` letter-spacing. Use `font-variant-numeric: tabular-nums`
  wherever digits line up in a column.

**Filled-accent buttons must be `font-weight: 700`, not 500.** `--on-accent` on
`--accent` fails normal-text AA contrast in the two light periods (3.93:1 and
4.37:1 against the 4.5:1 threshold) — it only clears WCAG's large-text
carve-off at bold weight and ~15px+. Small filled-accent controls below that
size (e.g. the period switcher's active pill) are exempt as UI components
under WCAG 1.4.11 (3:1, which the pair clears in every period) rather than
text — don't force them bold just to chase the text threshold.

---

## Architecture rules

These exist because the point of the project is to demonstrate backend ability.
Supabase makes it easy to skip writing a backend at all. Don't.

- **Browser code never touches the database.** No `supabase-js` queries inside
  Client Components. All data access goes through Server Components, Server
  Actions, or Route Handlers under `app/api/`.
- **Domain logic lives in `lib/domain/`** as plain TypeScript, called from the
  server layer. Not in components. Not in RLS policies alone.
- **RLS is enabled on every table** as defence in depth — but it is not where
  business rules live.
- **Stock deduction runs in a Postgres function** called via RPC, using
  `SELECT ... FOR UPDATE`. Two simultaneous orders for the last unit must not
  both succeed. This is deliberate. Do not simplify it away — it is the single
  strongest backend talking point in the project.
- **Analytics aggregations are written as SQL**, not assembled in TypeScript.
- **Every schema change is a migration** in `supabase/migrations/`. Never edit
  the schema through the Supabase dashboard.

### Suggested structure

```
app/
  (site)/          public café site
  admin/           owner dashboard
  api/             route handlers
components/        presentational; no data fetching
lib/
  db/              typed queries, server-only
  domain/          business rules (orders, inventory, loyalty)
supabase/
  migrations/
  seed.sql
docs/              BACKLOG.md, DECISIONS.md
  reference/       static mockups — open in a browser, do not import
```

### Reference mockups

`docs/reference/homepage-dusk.html` and `homepage-morning.html` are static
mockups of the same page at two hours. Open them in a browser to see the intended
layout, hierarchy and theming behaviour — the lamp goes off, the lit windows
across the street go dark, the rain eases.

They are **reference, not production code**: inline styles, no components, no
responsive behaviour, hardcoded hex instead of tokens. One part is directly
reusable — the window scene is hand-authored SVG whose fills map onto the tokens
above, and it is a reasonable starting point for the hero component rather than
something to redraw from scratch.

---

## The five demo rules

Because nobody will ever place a real order, the site has to work harder to feel
inhabited. These govern every feature.

1. **No empty states on arrival.** Six months of seeded orders, a stocked menu,
   a filled corkboard, a loyalty card partway through. An empty admin table
   reads as unfinished, not as "no data yet."
2. **Compress time.** A real order takes eight minutes; this one advances
   Received → Brewing → Ready in about forty seconds, so a reviewer sees the
   whole lifecycle.
3. **Hand over the keys.** Demo credentials printed on the login screen with a
   one-click fill. Never make a reviewer sign up.
4. **Admit it's a demo.** A small persistent badge, and a working "Reset demo
   data" control.
5. **Two clicks to anything.** Every feature must be reachable from the homepage
   in two clicks. Work nobody finds is work nobody credits.

---

## Scope guardrails

Read these before proposing new work.

- **There is no deadline.** This is worked on at Paul's own pace, in his own
  time. Do not propose schedules, estimate calendar dates, or introduce urgency.
  Sizes in the backlog are relative to each other, not to a calendar.
- **Two signature frontend interactions, not five.** Two finished beats five
  half-built, and half-built reads as a warning sign rather than ambition.
- **Model the menu with a recipe table from day one** — drinks composed of
  ingredients, not flat rows with a price. Costs an hour now; saves a painful
  migration if inventory gets built later.
- **Deploy as soon as there's a page worth loading**, ugly or not. Projects that
  stay on localhost until they're "ready" tend not to ship.
- **Feature freeze before the portfolio layer.** An untimed project doesn't fail
  by running late, it fails by never converging — there's always one more
  feature. At some point everything currently working becomes the scope and
  everything else moves to a v2 list. After the freeze: analytics, case study,
  accessibility pass, performance, README, and nothing else.

---

## Non-goals

Deliberately not building. Say so in the README — naming what you chose not to
build reads as judgment.

- Real payment processing (a simulated gateway is better here — it lets us
  demonstrate declines, timeouts and retries instead of only the happy path)
- Real transactional email
- Multi-location / multi-tenant support
- A native mobile app
- Public account signup at scale, password reset, account recovery
- CMS integration
- Internationalisation

---

## Known traps

- **App Router caching.** The public menu is statically cached, so an admin
  toggling an item sold out won't show until revalidation. Use `revalidateTag` /
  `revalidatePath` from the admin mutation. Expect to hit this as soon as the
  admin exists — it's a real Next.js skill, not a bug.
- **Contrast.** Dim lofi palettes are exactly where sites like this fail
  accessibility. Check contrast in all four periods, not just the default one —
  and note that `--accent-text` exists precisely because the light periods failed
  this check. Expect to find more cases like it.
- **Audio sourcing.** CC0 lofi tracks and ambient loops take longer to find,
  trim and loop cleanly than anyone budgets. Start it early and let it run in
  the background rather than treating it as a task to begin later.

---

## Working agreements

- Prefer Server Components; reach for `"use client"` only where interactivity
  actually requires it.
- Keep components presentational. Data fetching belongs in the server layer.
- `prefers-reduced-motion` degrades to a quieter version, not to nothing.
- Ask before adding a dependency that overlaps with something already here.
- When a decision gets made, record it in `docs/DECISIONS.md`.
