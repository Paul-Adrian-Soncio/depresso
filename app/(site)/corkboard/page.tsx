import { getCorkboardNotes } from "@/lib/db/corkboard";
import { CorkboardNoteCard } from "@/components/corkboard-note";
import { CorkboardForm } from "@/components/corkboard-form";
import { PageHeader } from "@/components/page-header";
import { SiteHeader } from "@/components/site-header";

export default async function CorkboardPage() {
  const notes = await getCorkboardNotes();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 px-8 py-16">
        <PageHeader
          title="The corkboard"
          description="Whatever people leave behind. No account needed — pin something and it's up right away."
        />

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
    </>
  );
}
