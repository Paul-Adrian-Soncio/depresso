"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { removeCorkboardNoteAction } from "@/app/admin/(dashboard)/admincontrols/actions";
import type { CorkboardNote } from "@/lib/db/corkboard";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Reactive moderation, not a pre-approval queue: notes go live the moment
 * they're posted (see docs/DECISIONS.md), so this is the "remove after the
 * fact" half of that model — every note is listed with its own delete,
 * newest first so anything just posted is easy to find and review.
 */
export function CorkboardModeration({ notes: initialNotes }: { notes: CorkboardNote[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  function remove(noteId: string) {
    startTransition(async () => {
      await removeCorkboardNoteAction(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    });
  }

  if (notes.length === 0) {
    return (
      <p className="rounded-md border border-line bg-surface p-4 font-mono text-sm text-ink-3">
        No notes posted yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
      {notes.map((note) => (
        <div key={note.id} className="flex items-start justify-between gap-4 p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.1em] text-accent-text">
                {note.authorName}
              </span>
              <span className="font-mono text-[10px] text-ink-3">
                {formatDateTime(note.createdAt)}
              </span>
            </div>
            <p className="font-body text-sm text-ink-2">{note.message}</p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => remove(note.id)}
            aria-label={`Remove note from ${note.authorName}`}
            className="flex flex-none items-center gap-1.5 rounded-sm border border-line-strong px-2.5 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:border-accent hover:text-accent-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={12} />
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
