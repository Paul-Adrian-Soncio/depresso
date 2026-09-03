import { ResetDemoDataButton } from "@/components/admin/reset-demo-data-button";
import { CorkboardModeration } from "@/components/admin/corkboard-moderation";
import { getCorkboardNotes } from "@/lib/db/corkboard";

/**
 * Deliberately not linked from AdminNav — reachable only by typing the URL,
 * gated by the same admin session as everything else under /admin.
 * Consolidates every "dangerous or unmoderated" control that shouldn't sit
 * next to the ordinary admin surface any reviewer with the demo password
 * could reach: the shared-database reset (see docs/DECISIONS.md — no
 * multi-tenancy, so this affects everyone on the live site) and corkboard
 * note moderation (notes go live immediately when posted, this is the
 * remove-after-the-fact half of that model).
 */
export default async function AdminControlsPage() {
  const notes = await getCorkboardNotes();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Reset demo data</h1>
          <p className="max-w-lg font-body text-sm text-ink-2">
            Restores ingredients, the menu, and a freshly generated ~90 days of order
            history to their original seeded shape. Undoes anything simulation mode or
            manual admin edits have changed.
          </p>
        </div>
        <ResetDemoDataButton />
      </div>

      <div className="flex flex-col gap-4 border-t border-line pt-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">Corkboard notes</h2>
          <p className="max-w-lg font-body text-sm text-ink-2">
            Notes go live the moment someone posts one — no approval queue. Remove
            anything that shouldn&apos;t be up.
          </p>
        </div>
        <CorkboardModeration notes={notes} />
      </div>
    </div>
  );
}
