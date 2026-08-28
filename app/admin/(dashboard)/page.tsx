import { getMenu } from "@/lib/db/menu";
import { MenuTable } from "@/components/admin/menu-table";

export default async function AdminMenuPage() {
  const menu = await getMenu();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Menu</h1>
        <p className="font-body text-sm text-ink-2">
          Toggle a drink sold out and it greys out on the public site immediately — no
          refresh needed. Stock-driven unavailability (an ingredient running out) shows
          here too, but isn&apos;t something you toggle by hand.
        </p>
      </div>
      <MenuTable items={menu} />
    </div>
  );
}
