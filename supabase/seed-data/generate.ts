/**
 * Generates supabase/seed.sql from the typed seed data in this directory.
 * Run with `npx tsx supabase/seed-data/generate.ts` (or `npm run seed:gen`)
 * whenever the menu/ingredients/customer list changes — the output file is
 * checked in and consumed by `supabase db reset`, not generated at reset
 * time, so there's no live DB dependency to regenerate it.
 *
 * IDs are assigned here (not left to gen_random_uuid() defaults) so
 * recipe_items / order_items can reference menu_items / ingredients by a
 * value this script controls, in a single static SQL file.
 */

import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SEED_INGREDIENTS } from "./ingredients";
import { SEED_MENU } from "./menu";
import { SEED_CUSTOMER_NAMES } from "./customers";

const THREE_MONTHS_IN_DAYS = 90;
const CAFE_OPEN_HOUR = 6;
const CAFE_CLOSE_HOUR = 22;

// The cafe is in Iloilo City, Philippines — UTC+8, no daylight saving.
// Building Date objects via setHours() uses the *host machine's* local
// timezone, not the cafe's, so "6am cafe time" would land at whatever UTC
// hour the machine running this script happens to produce — wrong on any
// machine not itself set to UTC+8. toCafeTimeUtc() sidesteps that by doing
// the offset arithmetic directly instead of going through local-timezone
// Date methods at all.
const CAFE_UTC_OFFSET_HOURS = 8;

function toCafeTimeUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(year, month, day, hour - CAFE_UTC_OFFSET_HOURS, minute));
}

// Deterministic-enough PRNG (mulberry32) so the generated file is
// reproducible between runs given the same seed — easier to review a diff
// when re-running doesn't reshuffle everything.
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

const rand = mulberry32(20260828);

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlTimestamp(date: Date): string {
  return `'${date.toISOString()}'`;
}

// ---------------------------------------------------------------------
// ingredients

const ingredientIds = new Map<string, string>();
const ingredientRows: string[] = [];

for (const ing of SEED_INGREDIENTS) {
  const id = randomUUID();
  ingredientIds.set(ing.name, id);
  ingredientRows.push(
    `  (${sqlString(id)}, ${sqlString(ing.name)}, ${sqlString(ing.unit)}, ${ing.stockQuantity}, ${ing.lowStockThreshold})`,
  );
}

// ---------------------------------------------------------------------
// menu_items + recipe_items

const menuItemIds = new Map<string, string>();
const menuItemRows: string[] = [];
const recipeItemRows: string[] = [];

SEED_MENU.forEach((item, index) => {
  const id = randomUUID();
  menuItemIds.set(item.name, id);
  menuItemRows.push(
    `  (${sqlString(id)}, ${sqlString(item.name)}, ${sqlString(item.description)}, ${sqlString(item.moodTag)}, ${item.priceCents}, false, null, ${index})`,
  );

  for (const ingredient of item.recipe) {
    const ingredientId = ingredientIds.get(ingredient.ingredientName);
    if (!ingredientId) {
      throw new Error(
        `Recipe for "${item.name}" references unknown ingredient "${ingredient.ingredientName}" — add it to seed-data/ingredients.ts`,
      );
    }
    recipeItemRows.push(
      `  (${sqlString(id)}, ${sqlString(ingredientId)}, ${ingredient.quantityRequired})`,
    );
  }
});

// ---------------------------------------------------------------------
// orders + order_items
//
// A mixed weekday/weekend curve, not a strict split — some weekdays run
// busier than some weekends, since a rigid split reads less like a real
// shop than like a rule. Order count per day is randomised within a band
// that itself shifts day to day.

const orderRows: string[] = [];
const orderItemRows: string[] = [];

const now = new Date();
now.setUTCSeconds(0, 0);

const startDate = new Date(now);
startDate.setUTCDate(startDate.getUTCDate() - THREE_MONTHS_IN_DAYS);

const menuEntries = SEED_MENU.map((item) => ({
  id: menuItemIds.get(item.name)!,
  priceCents: item.priceCents,
}));

function addOrder(orderedAt: Date, status: string) {
  const orderId = randomUUID();
  const lineItemCount = randInt(1, 3);
  const chosenItems = new Set<string>();
  let totalCents = 0;

  while (chosenItems.size < lineItemCount) {
    chosenItems.add(pick(menuEntries).id);
  }

  for (const menuItemId of chosenItems) {
    const menuEntry = menuEntries.find((m) => m.id === menuItemId)!;
    const quantity = randInt(1, 2);
    totalCents += menuEntry.priceCents * quantity;
    orderItemRows.push(
      `  (${sqlString(randomUUID())}, ${sqlString(orderId)}, ${sqlString(menuItemId)}, ${quantity}, ${menuEntry.priceCents})`,
    );
  }

  orderRows.push(
    `  (${sqlString(orderId)}, ${sqlString(pick(SEED_CUSTOMER_NAMES))}, ${sqlString(status)}, ${totalCents}, ${sqlTimestamp(orderedAt)})`,
  );
}

for (let dayOffset = 0; dayOffset <= THREE_MONTHS_IN_DAYS; dayOffset++) {
  // Walk the calendar date in UTC terms (dayOffset days after startDate's
  // UTC date), then treat that Y/M/D as the cafe's *local* calendar date
  // when building each order's timestamp — avoids local-timezone Date
  // methods (setDate/setHours) entirely, so this produces the same output
  // on any machine regardless of what timezone it's running in.
  const dayUtc = new Date(startDate);
  dayUtc.setUTCDate(dayUtc.getUTCDate() + dayOffset);
  const year = dayUtc.getUTCFullYear();
  const month = dayUtc.getUTCMonth();
  const dayOfMonth = dayUtc.getUTCDate();

  // Busy-day roll is independent of weekday/weekend — roughly a third of
  // any given day, weekday or weekend, turns out to be a busy one.
  const isBusyDay = rand() < 0.35;
  const orderCount = isBusyDay ? randInt(18, 32) : randInt(6, 17);

  for (let i = 0; i < orderCount; i++) {
    const hour = randInt(CAFE_OPEN_HOUR, CAFE_CLOSE_HOUR - 1);
    const minute = randInt(0, 59);
    const orderedAt = toCafeTimeUtc(year, month, dayOfMonth, hour, minute);

    // Skip anything that would land in the future relative to "now".
    if (orderedAt > now) continue;

    const status = rand() < 0.06 ? "cancelled" : "completed";
    addOrder(orderedAt, status);
  }
}

// Demo rule 2 ("compress time"): a handful of orders explicitly placed in
// the last 45 minutes, one per lifecycle stage, so the admin/queue view has
// something moving on it the moment a reviewer opens it — not left to
// chance the random day-by-day loop above happened to land one there.
const liveLifecycleStatuses = ["received", "brewing", "ready"];
for (let i = 0; i < liveLifecycleStatuses.length; i++) {
  const orderedAt = new Date(now.getTime() - randInt(2, 45) * 60000);
  addOrder(orderedAt, liveLifecycleStatuses[i]);
}

// ---------------------------------------------------------------------
// assemble

const sql = `-- Generated by supabase/seed-data/generate.ts — do not hand-edit.
-- Regenerate with: npx tsx supabase/seed-data/generate.ts
--
-- Restored automatically by \`supabase db reset\`. ${SEED_INGREDIENTS.length} ingredients,
-- ${SEED_MENU.length} menu items, ${orderRows.length} orders spanning the last
-- ${THREE_MONTHS_IN_DAYS} days, generated ${new Date().toISOString()}.

begin;

insert into ingredients (id, name, unit, stock_quantity, low_stock_threshold)
values
${ingredientRows.join(",\n")};

insert into menu_items (id, name, description, mood_tag, price_cents, is_sold_out, sold_out_reason, display_order)
values
${menuItemRows.join(",\n")};

insert into recipe_items (menu_item_id, ingredient_id, quantity_required)
values
${recipeItemRows.join(",\n")};

insert into orders (id, customer_name, status, total_cents, created_at)
values
${orderRows.join(",\n")};

insert into order_items (id, order_id, menu_item_id, quantity, unit_price_cents)
values
${orderItemRows.join(",\n")};

commit;
`;

const outPath = fileURLToPath(new URL("../seed.sql", import.meta.url));
writeFileSync(outPath, sql, "utf-8");

console.log(`Wrote ${outPath}`);
console.log(
  `${SEED_INGREDIENTS.length} ingredients, ${SEED_MENU.length} menu items, ${recipeItemRows.length} recipe rows, ${orderRows.length} orders, ${orderItemRows.length} order items`,
);
