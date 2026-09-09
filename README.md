# Depresso

A lofi coffee shop that only exists on the internet.

Depresso is a simulation, not a product. There are no real customers, no real
espresso, no real money. Every order in the database was either seeded or
placed by a demo. That constraint is the point: the project exists to
demonstrate fullstack ability, specifically a real backend under a polished
frontend, not to sell coffee.

**Live demo:** _add the deployed URL here after pushing to Vercel_
**Case study:** [`/case-study`](app/(site)/case-study/page.tsx). The design
decisions, tradeoffs, and a real debugging story, written up in more depth
than this file.

---

## What's actually here

- **A public site** that shifts palette, hero art, ambient audio, and copy
  across four real time-of-day periods (morning / afternoon / dusk / late),
  driven by the visitor's own clock with a manual override.
- **A real order-ahead flow**: cart → simulated checkout (with a genuine,
  occasional decline and an always-recoverable retry) → a live status page
  that polls and auto-advances.
- **A public order queue** (`/queue`) and a **staff POS** (`/admin/pos`) that
  both write through the same order-placement path as the customer checkout,
  including the same stock deduction.
- **Race-safe inventory.** Stock deduction runs inside a single Postgres
  function with `SELECT ... FOR UPDATE`, so two orders racing for the last
  unit of an ingredient can't both succeed. This is the strongest single
  backend claim in the project. See decision 01 in the case study.
- **An admin dashboard**: menu CRUD, live orders, stock levels, analytics
  computed in SQL, a corkboard moderation queue, and a simulation mode that
  places real fake orders against the real backend so a reviewer can watch
  the whole system move without placing an order themselves.
- **A public corkboard guestbook**, rate-limited server-side per IP, with
  admin moderation.
- **A dev-mode overlay** on the public site (footer toggle) that annotates
  the live UI with what's actually powering each piece: which component,
  which function, which file.

## What's deliberately not here

Named on purpose, not omitted by accident:

- Real payment processing. A simulated gateway is more useful here; it lets
  the checkout flow demonstrate a decline and a retry, not just a happy path.
- Real transactional email.
- Multi-location or multi-tenant support.
- A native mobile app.
- Public account signup, password reset, or account recovery.
- Internationalization.

Also true, and worth saying plainly: the admin section (dashboard, POS,
analytics) is gated to desktop/tablet widths only. It's a staff back-office
tool, and a dense multi-column dashboard squeezed onto a phone screen would
be worse than admitting it needs a bigger screen. The public site is fully
responsive; the admin isn't trying to be.

---

## Architecture

```
Browser
  │
  ├─ Public site (app/(site)/…)         Server Components by default
  │     └─ Client Components only where interactivity requires it
  │           (cart, checkout form, the corkboard form, the mixer, …)
  │
  ├─ Admin dashboard (app/admin/…)       Session-cookie gated
  │
  └─ Route handlers (app/api/…)          Polling endpoints, simulation ticks
        │
        ▼
  Server Actions / Route Handlers  ──────────────►  lib/domain/*
  (the only code that touches the DB)                business rules,
        │                                            plain TypeScript
        ▼
  lib/db/*  (typed queries, server-only)
        │
        ▼
  Supabase Postgres
    ├─ RLS enabled on every table (defence in depth, not where rules live)
    ├─ deduct_stock_for_order()  : SELECT ... FOR UPDATE, race-safe
    └─ analytics functions       : aggregation written in SQL, not TS
```

The rule this diagram is enforcing: **browser code never touches the
database.** No `supabase-js` calls inside Client Components, anywhere.
Supabase is used as Postgres-plus-auth, not as a backend-as-a-service. The
easy path Supabase invites, client-side queries plus RLS policies, would
undermine the entire point of the project, which is proving there's a real
backend underneath.

## Stack

Next.js (App Router, TypeScript, strict mode) · Tailwind CSS · Supabase
(Postgres, Auth) · Lucide icons. No animation library, no state management
library, no UI kit. Every interaction on the site is plain CSS transitions
or hand-rolled state.

---

## Running it locally

```bash
git clone https://github.com/Paul-Adrian-Soncio/depresso.git
cd depresso
npm install
```

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_DEMO_PASSWORD=
ADMIN_SESSION_SECRET=
```

`ADMIN_DEMO_PASSWORD` is meant to be visible, not secret. The admin login
screen shows it and fills it in automatically, per the project's own "hand
over the keys" rule. Nobody should have to guess a password to see the
backend. `ADMIN_SESSION_SECRET` signs the session cookie and is the one
value here that actually needs to stay private.

Apply the schema and seed data to a linked Supabase project:

```bash
npx supabase db reset --linked
```

`supabase/seed.sql` seeds roughly three months of plausible order history
with a realistic weekday/weekend curve, so the admin dashboard and analytics
never open to an empty table. A runtime "reset demo data" control at
`/admin/admincontrols` regenerates the same shape on demand, freshly rather
than replaying identical rows.

```bash
npm run dev
```

Then open `/admin/login`. The demo password is pre-filled, just submit.

---

## Performance & accessibility

Audited against a production build (`npm run build && npm start`), not dev
mode, since dev mode's unminified bundles skew every number pessimistically.

**Every public page** (`/`, `/menu`, `/checkout`, `/corkboard`, `/queue`,
`/case-study`): **100 accessibility, 100 best-practices, 100 SEO** on
Lighthouse, and **zero violations** on a full `axe-core` pass via Playwright
(a broader rule set than what Lighthouse's own accessibility score samples).
Performance: high-80s to high-90s on Lighthouse's simulated-mobile preset
(slow-4G-ish throttling, 4x CPU slowdown, the honest worst case), 98 to 100
on desktop.

The audit wasn't just a scorecard. It found and fixed three real bugs: a
skip link that pointed at an element only the homepage actually had, so it
was dead on six of seven pages; two elements whose `aria-label` didn't match
their visible text, so a screen reader announced something a sighted user
wouldn't hear said; and nested interactive elements on every menu card, a
clickable card wrapping a real `<button>` inside it, which is invalid
markup regardless of whether the click handlers still worked. All three are
written up in more detail in `docs/DECISIONS.md` and in the case study.

---

## Project structure

```
app/
  (site)/          public café site
  admin/           owner dashboard, session-cookie gated
  api/             route handlers (polling, simulation ticks)
components/        presentational; no data fetching
lib/
  db/              typed Supabase queries, server-only
  domain/          business rules (cart totals, period logic, simulation)
supabase/
  migrations/      every schema change, in order
  seed.sql         ~3 months of seeded order history
docs/
  DECISIONS.md     a running log of real tradeoffs, dated, with reasoning
  BACKLOG.md       what got built, what got cut, and why
```

## Further reading

- [`docs/DECISIONS.md`](docs/DECISIONS.md) is the honest version of this
  README: every real tradeoff, dated, with the reasoning kept rather than
  cleaned up after the fact.
- [`docs/BACKLOG.md`](docs/BACKLOG.md) shows what shipped, what's still
  open, and what was deliberately cut, tagged by size and which half of the
  stack it touches.
- [`/case-study`](app/(site)/case-study/page.tsx) is the narrative version:
  four decisions with real tradeoffs, and a debugging story about a Web
  Audio visualizer that looked broken for a genuinely interesting reason.
