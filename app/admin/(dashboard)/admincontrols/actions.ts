"use server";

import { revalidatePath } from "next/cache";
import { resetDemoData } from "@/lib/db/reset-demo-data";
import { deleteCorkboardNote } from "@/lib/db/corkboard";

export async function resetDemoDataAction() {
  const result = await resetDemoData();

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/stock");
  revalidatePath("/admin/analytics");
  revalidatePath("/");

  return result;
}

export async function removeCorkboardNoteAction(noteId: string) {
  await deleteCorkboardNote(noteId);

  revalidatePath("/admin/admincontrols");
  revalidatePath("/corkboard");
  revalidatePath("/");
}
