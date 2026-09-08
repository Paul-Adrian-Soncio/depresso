import type { CorkboardNote } from "@/lib/db/corkboard";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CorkboardNoteCard({
  note,
  onDelete,
}: {
  note: CorkboardNote;
  onDelete?: (noteId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-sm border border-line-strong bg-surface p-4 shadow-sm transition-transform duration-base hover:z-10 hover:scale-[1.02]">
      <p className="font-body text-[15px] leading-relaxed text-ink">{note.message}</p>
      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-accent-text">
          {note.authorName}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-ink-3">{formatDate(note.createdAt)}</span>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              aria-label={`Remove note from ${note.authorName}`}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-accent-text"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
