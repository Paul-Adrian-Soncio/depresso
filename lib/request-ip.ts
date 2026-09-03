import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort caller IP for rate limiting only — never displayed anywhere.
 * Server Actions don't get a Request object directly, so this reads the
 * same forwarded-for header a reverse proxy (Vercel and most hosts) sets;
 * x-forwarded-for can carry a comma-separated chain when multiple proxies
 * are involved; the first entry is the original client. Returns null in
 * local dev or on a host that doesn't set it — submitCorkboardNote treats
 * that as "can't rate-limit this request" rather than blocking it.
 */
export async function getRequestIp(): Promise<string | null> {
  const store = await headers();
  const forwardedFor = store.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }
  return store.get("x-real-ip");
}
