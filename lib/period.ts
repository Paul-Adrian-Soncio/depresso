import "server-only";
import { cookies } from "next/headers";
import { isPeriod, type Period } from "@/lib/domain/period";

const COOKIE_NAME = "depresso-period";

export async function getPeriod(): Promise<{ period: Period; hasCookie: boolean }> {
  const store = await cookies();
  const cookiePeriod = store.get(COOKIE_NAME)?.value;
  const hasCookie = isPeriod(cookiePeriod);
  return { period: hasCookie ? cookiePeriod : "dusk", hasCookie };
}
