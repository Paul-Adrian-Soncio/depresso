import { getCorkboardNotes } from "@/lib/db/corkboard";
import { CorkboardNoteCard } from "@/components/corkboard-note";

const PREVIEW_COUNT = 3;

/**
 * The homepage's read-only glimpse of the board — same "preview here, full
 * thing on its own page" split as the menu (MenuGridPreview / /menu).
 * Deliberately empty-state-tolerant rather than seeded: this board starts
 * genuinely empty on purpose (see docs/DECISIONS.md), so unlike the menu
 * or orders this has to handle "nothing here yet" gracefully rather than
 * assuming there's always something to show.
 */
export async function CorkboardPreview() {
  const notes = await getCorkboardNotes();
  const preview = notes.slice(0, PREVIEW_COUNT);

  if (preview.length === 0) {
    return (
      <p className="rounded-md border border-line bg-surface p-6 font-body text-sm text-ink-2">
        Nothing pinned yet — be the first to leave a note.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {preview.map((note) => (
        <CorkboardNoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
