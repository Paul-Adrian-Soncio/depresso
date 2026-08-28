/**
 * The nine-drink menu, as content — not runtime application data. The live
 * site reads the menu from Postgres (menu_items/recipe_items), matching the
 * architecture rule that domain data lives in the database, not hardcoded
 * in the app. This file exists so the seed script has one typed place to
 * source names/descriptions/prices/recipes from, instead of raw SQL
 * inserts with the copy buried in string literals.
 *
 * ingredients here are keyed by name and matched against the seeded
 * `ingredients` table by the seed script — see docs/DECISIONS.md for the
 * menu voice pass this came out of.
 */

export interface SeedRecipeIngredient {
  ingredientName: string;
  quantityRequired: number;
}

export interface SeedMenuItem {
  name: string;
  moodTag: string;
  description: string;
  priceCents: number;
  recipe: SeedRecipeIngredient[];
}

export const SEED_MENU: SeedMenuItem[] = [
  {
    name: "Existential Espresso",
    moodTag: "Wired",
    description: "Two shots. No answers.",
    priceCents: 420,
    recipe: [{ ingredientName: "Espresso beans", quantityRequired: 18 }],
  },
  {
    name: "Monday Mocha",
    moodTag: "Coping",
    description: "Chocolate, because it is Monday.",
    priceCents: 520,
    recipe: [
      { ingredientName: "Espresso beans", quantityRequired: 18 },
      { ingredientName: "Whole milk", quantityRequired: 180 },
      { ingredientName: "Chocolate syrup", quantityRequired: 20 },
    ],
  },
  {
    name: "Cold Brew Contemplation",
    moodTag: "Pensive",
    description: "Steeped overnight. Like the thought.",
    priceCents: 580,
    recipe: [{ ingredientName: "Cold brew concentrate", quantityRequired: 250 }],
  },
  {
    name: "Oat Flat White",
    moodTag: "Steady",
    description: "Steady, dependable, quietly excellent.",
    priceCents: 500,
    recipe: [
      { ingredientName: "Espresso beans", quantityRequired: 18 },
      { ingredientName: "Oat milk", quantityRequired: 200 },
    ],
  },
  {
    name: "25th Hour",
    moodTag: "Unwise",
    description:
      "Unlock the hidden 25th hour of the day with this unhinged cup of coffee. Drink with absolute care.",
    priceCents: 650,
    recipe: [
      { ingredientName: "Espresso beans", quantityRequired: 18 },
      { ingredientName: "White energy drink", quantityRequired: 250 },
    ],
  },
  {
    name: "Chamomile for Later",
    moodTag: "Overthinking",
    description: "Caffeine-free. So is the excuse.",
    priceCents: 400,
    recipe: [{ ingredientName: "Chamomile tea bag", quantityRequired: 1 }],
  },
  {
    name: "Steamed Oat Milk",
    moodTag: "Lukewarm Regards",
    description: "No coffee. Just warmth and quiet judgment.",
    priceCents: 380,
    recipe: [{ ingredientName: "Oat milk", quantityRequired: 240 }],
  },
  {
    name: "Triple Espresso",
    moodTag: "Quiet Panic",
    description: "Three shots. You asked for this.",
    priceCents: 540,
    recipe: [{ ingredientName: "Espresso beans", quantityRequired: 27 }],
  },
  {
    name: "Cinnamon Cortado",
    moodTag: "Slow Burn",
    description: "Equal parts espresso, milk, and regret.",
    priceCents: 560,
    recipe: [
      { ingredientName: "Espresso beans", quantityRequired: 18 },
      { ingredientName: "Whole milk", quantityRequired: 90 },
      { ingredientName: "Cinnamon", quantityRequired: 2 },
    ],
  },
];
