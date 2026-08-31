import { ResetDemoDataButton } from "@/components/admin/reset-demo-data-button";

/**
 * Deliberately not linked from AdminNav — reachable only by typing the URL,
 * gated by the same admin session as everything else under /admin. See
 * docs/DECISIONS.md: this is a global, shared-database action (no
 * multi-tenancy), so it's kept out of the ordinary admin surface rather
 * than placed next to the simulation toggle where any reviewer with the
 * demo password could trigger it.
 */
export default function AdminResetPage() {
  return (
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
  );
}
