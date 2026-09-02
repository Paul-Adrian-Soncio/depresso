import { MenuCardShell } from "@/components/menu-card-shell";
import type { MenuItemWithAvailability } from "@/lib/db/menu";

/**
 * Read-only — the homepage shows the full menu so a visitor can see what's
 * on offer, but ordering only happens on /menu. No add-to-cart control, no
 * client interactivity needed at all.
 */
export function MenuCardPreview({ item }: { item: MenuItemWithAvailability }) {
  return <MenuCardShell item={item} />;
}
