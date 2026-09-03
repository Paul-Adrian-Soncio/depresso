"use server";

import { revalidatePath } from "next/cache";
import { submitCorkboardNote, type SubmitNoteResult } from "@/lib/db/corkboard";
import { getRequestIp } from "@/lib/request-ip";

export async function postNote(authorName: string, message: string): Promise<SubmitNoteResult> {
  const ip = await getRequestIp();
  const result = await submitCorkboardNote(authorName, message, ip);

  if (result.status === "posted") {
    revalidatePath("/corkboard");
    revalidatePath("/");
  }

  return result;
}
