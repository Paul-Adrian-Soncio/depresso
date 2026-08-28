-- Analytics, computed in SQL rather than assembled in TypeScript, per
-- CLAUDE.md's architecture rules. Three functions backing the admin
-- analytics page: most-ordered drinks, busiest hour of day, weekly volume.
-- All three exclude cancelled orders — an order that never happened
-- shouldn't count toward "most popular" or "revenue this week".

create function most_ordered_drinks(p_limit int default 5)
returns table (
  menu_item_id uuid,
  menu_item_name text,
  total_quantity bigint
)
language sql
stable
as $$
  select
    mi.id,
    mi.name,
    sum(oi.quantity)::bigint as total_quantity
  from order_items oi
  join orders o on o.id = oi.order_id
  join menu_items mi on mi.id = oi.menu_item_id
  where o.status != 'cancelled'
  group by mi.id, mi.name
  order by total_quantity desc
  limit p_limit;
$$;

comment on function most_ordered_drinks is 'Top drinks by total quantity ordered, excluding cancelled orders.';

create function busiest_hours()
returns table (
  hour_of_day int,
  order_count bigint
)
language sql
stable
as $$
  select
    extract(hour from created_at)::int as hour_of_day,
    count(*)::bigint as order_count
  from orders
  where status != 'cancelled'
  group by hour_of_day
  order by hour_of_day;
$$;

comment on function busiest_hours is 'Order count per hour of day (0-23), all history, excluding cancelled orders. Client sums/sorts to find the busiest.';

create function weekly_volume()
returns table (
  week_start date,
  order_count bigint,
  revenue_cents bigint
)
language sql
stable
as $$
  select
    date_trunc('week', created_at)::date as week_start,
    count(*)::bigint as order_count,
    sum(total_cents)::bigint as revenue_cents
  from orders
  where status != 'cancelled'
  group by week_start
  order by week_start;
$$;

comment on function weekly_volume is 'Order count and revenue per calendar week, excluding cancelled orders.';
