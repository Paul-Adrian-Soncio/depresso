"use server";

import { revalidatePath } from "next/cache";
import { resetDemoData } from "@/lib/db/reset-demo-data";

export async function resetDemoDataAction() {
  const result = await resetDemoData();

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/stock");
  revalidatePath("/admin/analytics");
  revalidatePath("/");

  return result;
}
