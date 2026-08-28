import "server-only";
import { createServiceRoleClient } from "@/lib/db/client";

export interface MostOrderedDrink {
  menuItemId: string;
  menuItemName: string;
  totalQuantity: number;
}

export interface HourlyVolume {
  hourOfDay: number;
  orderCount: number;
}

export interface WeeklyVolume {
  weekStart: string;
  orderCount: number;
  revenueCents: number;
}

/**
 * All three aggregations are computed in Postgres (see
 * supabase/migrations/20260829012540_analytics_functions.sql), per
 * CLAUDE.md's architecture rule that analytics aggregations are written as
 * SQL, not assembled in TypeScript. This module just calls them and maps
 * snake_case rows to the shape components expect.
 */

export async function getMostOrderedDrinks(limit = 5): Promise<MostOrderedDrink[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc("most_ordered_drinks", { p_limit: limit });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    menuItemId: row.menu_item_id,
    menuItemName: row.menu_item_name,
    totalQuantity: row.total_quantity,
  }));
}

export async function getBusiestHours(): Promise<HourlyVolume[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc("busiest_hours");
  if (error) throw error;

  return (data ?? []).map((row) => ({
    hourOfDay: row.hour_of_day,
    orderCount: row.order_count,
  }));
}

export async function getWeeklyVolume(): Promise<WeeklyVolume[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc("weekly_volume");
  if (error) throw error;

  return (data ?? []).map((row) => ({
    weekStart: row.week_start,
    orderCount: row.order_count,
    revenueCents: row.revenue_cents,
  }));
}
