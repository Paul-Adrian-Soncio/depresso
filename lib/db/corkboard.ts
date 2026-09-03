import "server-only";
import { createServiceRoleClient } from "@/lib/db/client";

export interface CorkboardNote {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
}

const RATE_LIMIT_WINDOW_MS = 3 * 60 * 1000;

/**
 * All notes, newest first — used by both the homepage preview (sliced to a
 * handful) and the full /corkboard page. poster_ip is deliberately never
 * selected here; nothing that reads this function can leak it into a UI.
 */
export async function getCorkboardNotes(): Promise<CorkboardNote[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("corkboard_notes")
    .select("id, author_name, message, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    authorName: row.author_name,
    message: row.message,
    createdAt: row.created_at,
  }));
}

export type SubmitNoteResult =
  | { status: "posted"; note: CorkboardNote }
  | { status: "rate-limited"; retryAfterSeconds: number }
  | { status: "invalid"; reason: string };

/**
 * Posts a note, enforcing the rate limit here rather than trusting the
 * caller — this is the one place any note ever gets written, so it's the
 * only place that needs to check. One post per IP per
 * RATE_LIMIT_WINDOW_MS: looks up that IP's most recent note (the
 * poster_ip index makes this cheap) rather than counting posts in a
 * window, so a burst of old activity from one IP doesn't matter, only how
 * recently they last posted.
 */
export async function submitCorkboardNote(
  authorName: string,
  message: string,
  posterIp: string | null,
): Promise<SubmitNoteResult> {
  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return { status: "invalid", reason: "A note needs a message." };
  }
  if (trimmedMessage.length > 280) {
    return { status: "invalid", reason: "Keep it under 280 characters." };
  }

  const supabase = createServiceRoleClient();

  if (posterIp) {
    const { data: recent, error: recentError } = await supabase
      .from("corkboard_notes")
      .select("created_at")
      .eq("poster_ip", posterIp)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentError) throw recentError;

    if (recent) {
      const elapsedMs = Date.now() - new Date(recent.created_at).getTime();
      if (elapsedMs < RATE_LIMIT_WINDOW_MS) {
        return {
          status: "rate-limited",
          retryAfterSeconds: Math.ceil((RATE_LIMIT_WINDOW_MS - elapsedMs) / 1000),
        };
      }
    }
  }

  const trimmedName = authorName.trim();
  const { data: inserted, error: insertError } = await supabase
    .from("corkboard_notes")
    .insert({
      author_name: trimmedName.length > 0 ? trimmedName.slice(0, 60) : "Anonymous",
      message: trimmedMessage,
      poster_ip: posterIp,
    })
    .select("id, author_name, message, created_at")
    .single();

  if (insertError) throw insertError;

  return {
    status: "posted",
    note: {
      id: inserted.id,
      authorName: inserted.author_name,
      message: inserted.message,
      createdAt: inserted.created_at,
    },
  };
}

export async function deleteCorkboardNote(noteId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("corkboard_notes").delete().eq("id", noteId);
  if (error) throw error;
}
