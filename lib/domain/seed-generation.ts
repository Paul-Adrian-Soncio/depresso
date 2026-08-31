/**
 * The core order-history generator, shared between two callers:
 *  - supabase/seed-data/generate.ts (build time) — serializes this into
 *    supabase/seed.sql, restored by `supabase db reset`.
 *  - the hidden admin reset action (app/admin/reset) — calls this directly
 *    at request time to regenerate the same shape of data against the live
 *    database, since there's no way to run the Supabase CLI from a deployed
 *    server action.
 *
 * Kept framework/IO-free (no randomUUID, no SQL, no Supabase client) so
 * both callers can format the output however they need — SQL text on one
 * side, plain rows for a client insert on the other — without the
 * generation algorithm itself ever being duplicated or drifting between
 * the two paths.
 */

const THREE_MONTHS_IN_DAYS = 90;
const CAFE_OPEN_HOUR = 6;
const CAFE_CLOSE_HOUR = 22;

// The cafe is in Iloilo City, Philippines — UTC+8, no daylight saving. See
// generate.ts's longer comment on why this goes through Date.UTC() directly
// rather than any local-timezone Date method.
const CAFE_UTC_OFFSET_HOURS = 8;

function toCafeTimeUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(year, month, day, hour - CAFE_UTC_OFFSET_HOURS, minute));
}

// Deterministic-enough PRNG (mulberry32). The build-time script seeds this
// with a fixed number for reproducible diffs; the runtime reset path seeds
// it from the current time instead, so every reset looks like a distinct
// plausible history rather than the exact same 1500 orders every time.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GeneratedOrderLine {
  menuItemId: string;
  quantity: number;
  unitPriceCents: number;
}

export interface GeneratedOrder {
  customerName: string;
  status: "completed" | "cancelled" | "received" | "brewing" | "ready";
  totalCents: number;
  createdAt: Date;
  lines: GeneratedOrderLine[];
}

export interface GenerateOrderHistoryOptions {
  /** PRNG seed — pass a fixed number for reproducible output, or Date.now() for varied output each call. */
  seed: number;
  menu: { id: string; priceCents: number }[];
  customerNames: readonly string[];
  /** Defaults to now. */
  now?: Date;
}

/**
 * Three months of plausible order history plus a handful of orders in the
 * last 45 minutes at each active lifecycle stage (demo rule 2: "compress
 * time" — so the admin queue has something moving on arrival). Mirrors
 * generate.ts's algorithm exactly: mixed weekday/weekend curve, ~35% of
 * days are "busy," 1-3 line items per order, quantity 1-2 per line, 6% of
 * historical orders cancelled rather than completed.
 */
export function generateOrderHistory(options: GenerateOrderHistoryOptions): GeneratedOrder[] {
  const { seed, menu, customerNames } = options;
  const now = options.now ?? new Date();
  now.setUTCSeconds(0, 0);

  const rand = mulberry32(seed);
  const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = <T,>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)];

  const orders: GeneratedOrder[] = [];

  function addOrder(orderedAt: Date, status: GeneratedOrder["status"]) {
    const lineItemCount = randInt(1, 3);
    const chosen = new Map<string, (typeof menu)[number]>();
    while (chosen.size < lineItemCount) {
      const item = pick(menu);
      chosen.set(item.id, item);
    }

    const lines: GeneratedOrderLine[] = [...chosen.values()].map((item) => ({
      menuItemId: item.id,
      quantity: randInt(1, 2),
      unitPriceCents: item.priceCents,
    }));

    const totalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
    orders.push({ customerName: pick(customerNames), status, totalCents, createdAt: orderedAt, lines });
  }

  const startDate = new Date(now);
  startDate.setUTCDate(startDate.getUTCDate() - THREE_MONTHS_IN_DAYS);

  for (let dayOffset = 0; dayOffset <= THREE_MONTHS_IN_DAYS; dayOffset++) {
    const dayUtc = new Date(startDate);
    dayUtc.setUTCDate(dayUtc.getUTCDate() + dayOffset);
    const year = dayUtc.getUTCFullYear();
    const month = dayUtc.getUTCMonth();
    const dayOfMonth = dayUtc.getUTCDate();

    const isBusyDay = rand() < 0.35;
    const orderCount = isBusyDay ? randInt(18, 32) : randInt(6, 17);

    for (let i = 0; i < orderCount; i++) {
      const hour = randInt(CAFE_OPEN_HOUR, CAFE_CLOSE_HOUR - 1);
      const minute = randInt(0, 59);
      const orderedAt = toCafeTimeUtc(year, month, dayOfMonth, hour, minute);

      if (orderedAt > now) continue;

      const status = rand() < 0.06 ? "cancelled" : "completed";
      addOrder(orderedAt, status);
    }
  }

  const liveLifecycleStatuses: GeneratedOrder["status"][] = ["received", "brewing", "ready"];
  for (const status of liveLifecycleStatuses) {
    const orderedAt = new Date(now.getTime() - randInt(2, 45) * 60000);
    addOrder(orderedAt, status);
  }

  return orders;
}
