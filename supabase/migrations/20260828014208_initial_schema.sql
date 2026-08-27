-- Initial schema: menu (recipe-based), inventory, orders.
-- Architecture rules (CLAUDE.md): RLS on every table as defence in depth,
-- but business rules live in Postgres functions / the server layer, not in
-- RLS alone. Stock deduction runs in a function using SELECT ... FOR UPDATE
-- so two simultaneous orders for the last unit cannot both succeed.

create extension if not exists "pgcrypto";

-- ingredients ----------------------------------------------------------

create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unit text not null, -- e.g. "ml", "shot", "g"
  stock_quantity numeric not null default 0 check (stock_quantity >= 0),
  low_stock_threshold numeric not null default 0 check (low_stock_threshold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table ingredients is 'Stock is tracked in whatever unit the ingredient is measured in (unit column); recipe_items.quantity_required is in the same unit.';

-- menu_items -------------------------------------------------------------

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  mood_tag text,
  price_cents integer not null check (price_cents >= 0),
  is_sold_out boolean not null default false, -- manual override, independent of stock
  sold_out_reason text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table menu_items is 'is_sold_out is a manual toggle. Whether stock alone would sell an item out is derived at query time from recipe_items + ingredients, not stored here.';

-- recipe_items -------------------------------------------------------------
-- Join table: what a menu item is made of. This is the "recipe table from
-- day one" decision (docs/DECISIONS.md) — drinks are composed of
-- ingredients, not flat rows with a price.

create table recipe_items (
  menu_item_id uuid not null references menu_items (id) on delete cascade,
  ingredient_id uuid not null references ingredients (id) on delete restrict,
  quantity_required numeric not null check (quantity_required > 0),
  primary key (menu_item_id, ingredient_id)
);

-- orders -------------------------------------------------------------

create type order_status as enum ('received', 'brewing', 'ready', 'completed', 'cancelled');

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  status order_status not null default 'received',
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- order_items -------------------------------------------------------------

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  menu_item_id uuid not null references menu_items (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  -- price at order time, snapshotted so later menu price changes don't
  -- rewrite history
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

-- indexes -------------------------------------------------------------

create index recipe_items_ingredient_id_idx on recipe_items (ingredient_id);
create index order_items_order_id_idx on order_items (order_id);
create index order_items_menu_item_id_idx on order_items (menu_item_id);
create index orders_status_idx on orders (status);
create index orders_created_at_idx on orders (created_at);

-- updated_at triggers -------------------------------------------------------------

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ingredients_set_updated_at
  before update on ingredients
  for each row execute function set_updated_at();

create trigger menu_items_set_updated_at
  before update on menu_items
  for each row execute function set_updated_at();

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- row level security -------------------------------------------------------------
-- Defence in depth, per CLAUDE.md: enabled everywhere, but the real rules
-- live in the server layer / this migration's functions, not here. Public
-- read access to the menu; everything else is server-only (service role
-- bypasses RLS, which is how Server Actions / route handlers will write).

alter table ingredients enable row level security;
alter table menu_items enable row level security;
alter table recipe_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "menu_items are publicly readable"
  on menu_items for select
  using (true);

create policy "recipe_items are publicly readable"
  on recipe_items for select
  using (true);

-- No public policies on ingredients, orders, or order_items: stock levels
-- and order data are not meant to be readable by anonymous clients. All
-- access to those tables goes through the server layer (service role).

-- stock deduction function -------------------------------------------------------------
-- The strongest single backend talking point in the project (CLAUDE.md):
-- locks each ingredient row before checking/decrementing stock, so two
-- concurrent orders for the last unit cannot both succeed. Raises if any
-- ingredient in the order would go negative, which rolls back the whole
-- transaction — the order is not partially fulfilled.

create function deduct_stock_for_order(p_order_id uuid)
returns void
language plpgsql
as $$
declare
  r record;
begin
  for r in
    select ri.ingredient_id, sum(ri.quantity_required * oi.quantity) as total_required
    from order_items oi
    join recipe_items ri on ri.menu_item_id = oi.menu_item_id
    where oi.order_id = p_order_id
    group by ri.ingredient_id
  loop
    perform 1 from ingredients where id = r.ingredient_id for update;

    update ingredients
    set stock_quantity = stock_quantity - r.total_required
    where id = r.ingredient_id
      and stock_quantity >= r.total_required;

    if not found then
      raise exception 'Insufficient stock for ingredient %', r.ingredient_id
        using errcode = 'P0001';
    end if;
  end loop;
end;
$$;

comment on function deduct_stock_for_order is 'Locks each ingredient row (SELECT ... FOR UPDATE) before deducting, so concurrent orders cannot both succeed against the last unit. Raises and rolls back the whole order if any ingredient would go negative.';
