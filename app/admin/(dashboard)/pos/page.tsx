import { getMenu } from "@/lib/db/menu";
import { PosTerminal } from "@/components/admin/pos-terminal";

export default async function AdminPosPage() {
  const menu = await getMenu();
  return <PosTerminal menu={menu} />;
}
