import type { CorkboardNote } from "@/lib/db/corkboard";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** A small, stable per-note tilt so the board doesn't look grid-perfect — deterministic from the note's own id, not random per render. */
function tiltForId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return ((hash % 7) - 3) * 0.6; // roughly -1.8deg to +1.8deg
}

export function CorkboardNoteCard({
  note,
  onDelete,
}: {
  note: CorkboardNote;
  onDelete?: (noteId: string) => void;
}) {
  return (
    <div
      style={{ transform: `rotate(${tiltForId(note.id)}deg)` }}
      className="flex flex-col gap-2 rounded-sm border border-line-strong bg-surface p-4 shadow-sm transition-transform duration-base hover:z-10 hover:rotate-0 hover:scale-[1.02]"
    >
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
