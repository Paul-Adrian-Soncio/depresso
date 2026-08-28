import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

/**
 * Anon-key client — subject to RLS. This is what the server layer uses for
 * anything a public visitor could see anyway (the menu). Never imported by
 * Client Components: browser code never touches the database directly, per
 * the architecture rules in CLAUDE.md.
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

/**
 * Service-role client — bypasses RLS. Only for server code that needs to
 * read/write tables with no public policy (orders, ingredients) or call
 * privileged functions (deduct_stock_for_order). Never exposed to the
 * browser; SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix on purpose.
 */
export function createServiceRoleClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
