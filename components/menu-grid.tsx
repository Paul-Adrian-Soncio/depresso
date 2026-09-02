import { getMenu } from "@/lib/db/menu";
import { MenuCard } from "@/components/menu-card";

export async function MenuGrid() {
  const menu = await getMenu();

  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
      {menu.map((item) => (
        <MenuCard key={item.id} item={item} />
      ))}
    </div>
  );
}
