import { getIngredients } from "@/lib/db/ingredients";
import { StockTable } from "@/components/admin/stock-table";

export default async function AdminStockPage() {
  const ingredients = await getIngredients();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Stock</h1>
        <p className="font-body text-sm text-ink-2">
          Adjust ingredient stock directly. Any drink whose recipe calls for more of an
          ingredient than is on hand goes out of stock on the public menu immediately —
          no separate toggle needed.
        </p>
      </div>
      <StockTable ingredients={ingredients} />
    </div>
  );
}
