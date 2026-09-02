import type { MenuItemWithAvailability } from "@/lib/db/menu";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * The shared visual shell for a menu item card — everything except the
 * add-to-cart control, which differs between the read-only homepage
 * preview (none) and the orderable /menu grid (a button). Kept as a plain
 * server-renderable component so the homepage preview never needs
 * "use client" at all.
 */
export function MenuCardShell({
  item,
  children,
}: {
  item: MenuItemWithAvailability;
  children?: React.ReactNode;
}) {
  const unavailable = item.isSoldOut || item.outOfStock;
  const reason =
    item.soldOutReason ??
    (item.missingIngredient ? `Sold out — no ${item.missingIngredient.toLowerCase()}` : "Sold out");

  return (
    <div
      className={`flex flex-col gap-[10px] rounded-[5px] border p-[22px] transition-transform duration-base ${
        unavailable
          ? "border-line bg-surface-2 opacity-55"
          : "border-line-strong bg-surface hover:z-10 hover:scale-[1.03] hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
            unavailable ? "text-ink-3" : "text-accent-text"
          }`}
        >
          {unavailable ? reason : item.moodTag}
        </p>
        {!unavailable && children}
      </div>
      <p
        className={`text-xl font-bold tracking-[-0.02em] leading-[1.15] text-ink ${
          unavailable ? "line-through decoration-1" : ""
        }`}
      >
        {item.name}
      </p>
      <p className={`font-body text-[15px] leading-[1.5] ${unavailable ? "text-ink-3" : "text-ink-2"}`}>
        {item.description}
      </p>
      <p className={`pt-[6px] font-mono text-sm tabular-nums ${unavailable ? "text-ink-3" : "text-ink"}`}>
        {formatPrice(item.priceCents)}
      </p>
    </div>
  );
}
