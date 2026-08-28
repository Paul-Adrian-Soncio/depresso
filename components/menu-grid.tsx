import { getMenu } from "@/lib/db/menu";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function MenuGrid() {
  const menu = await getMenu();

  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
      {menu.map((item) => {
        const unavailable = item.isSoldOut || item.outOfStock;
        const reason =
          item.soldOutReason ??
          (item.missingIngredient ? `Sold out — no ${item.missingIngredient.toLowerCase()}` : "Sold out");

        return (
          <div
            key={item.id}
            className={`flex flex-col gap-[10px] rounded-[5px] border p-[22px] ${
              unavailable ? "border-line bg-surface-2 opacity-55" : "border-line-strong bg-surface"
            }`}
          >
            <p
              className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                unavailable ? "text-ink-3" : "text-accent-text"
              }`}
            >
              {unavailable ? reason : item.moodTag}
            </p>
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
      })}
    </div>
  );
}
