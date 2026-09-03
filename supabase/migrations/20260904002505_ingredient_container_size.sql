-- Display-only addition: how many units of an ingredient's own tracking
-- unit come in one container (e.g. a 1000ml carton of milk). Purely for
-- showing "8000ml (~8 cartons)" and letting an admin restock by container
-- count in the UI — deduct_stock_for_order and every quantity in the
-- system still operate on stock_quantity in the ingredient's real unit
-- (ml/g/bag), unchanged. Nullable: some ingredients (Chamomile tea bag,
-- already tracked one-per-bag) have no meaningful container concept above
-- their own unit.

alter table ingredients
  add column container_size numeric check (container_size > 0);

comment on column ingredients.container_size is 'Units per container (e.g. 1000 for a 1000ml milk carton), for display/restock convenience only. Null where a container concept above the base unit does not apply. Never read by deduct_stock_for_order.';
