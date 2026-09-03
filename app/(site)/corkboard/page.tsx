import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCorkboardNotes } from "@/lib/db/corkboard";
import { CorkboardNoteCard } from "@/components/corkboard-note";
import { CorkboardForm } from "@/components/corkboard-form";

export default async function CorkboardPage() {
  const notes = await getCorkboardNotes();

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-8 py-16">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2"
        >
          <ArrowLeft size={13} />
          Back to the site
        </Link>
        <h1 className="text-[30px] font-bold tracking-[-0.025em] text-ink">The corkboard</h1>
        <p className="max-w-lg font-body text-sm text-ink-2">
          Whatever people leave behind. No account needed — pin something and
          it&apos;s up right away.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {notes.length === 0 ? (
          <p className="rounded-md border border-line bg-surface p-6 font-body text-sm text-ink-2">
            Nothing pinned yet — be the first.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <CorkboardNoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
        <div className="lg:sticky lg:top-8">
          <CorkboardForm />
        </div>
      </div>
    </main>
  );
}
