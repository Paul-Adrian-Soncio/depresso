import "server-only";
import { createServiceRoleClient } from "@/lib/db/client";

export interface IngredientWithStatus {
  id: string;
  name: string;
  unit: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isLow: boolean;
  /** Units of `unit` per container (e.g. 1000 for a 1000ml carton) — display/restock convenience only, null where no container concept applies. */
  containerSize: number | null;
}

export async function getIngredients(): Promise<IngredientWithStatus[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name, unit, stock_quantity, low_stock_threshold, container_size")
    .order("name", { ascending: true });

  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
    stockQuantity: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
    isLow: row.stock_quantity <= row.low_stock_threshold,
    containerSize: row.container_size,
  }));
}
