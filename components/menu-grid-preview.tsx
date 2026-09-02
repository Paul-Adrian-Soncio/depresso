import { getMenu } from "@/lib/db/menu";
import { MenuCardPreview } from "@/components/menu-card-preview";

/**
 * The homepage's read-only view of the menu — see what's on offer, no
 * add-to-cart. Ordering lives on /menu (components/menu-grid.tsx).
 */
export async function MenuGridPreview() {
  const menu = await getMenu();

  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
      {menu.map((item) => (
        <MenuCardPreview key={item.id} item={item} />
      ))}
    </div>
  );
}
