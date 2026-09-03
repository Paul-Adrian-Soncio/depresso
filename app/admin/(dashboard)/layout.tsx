"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { ForceDusk } from "@/components/admin/force-dusk";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // The POS is dense/edge-to-edge by design (see components/admin/pos-terminal.tsx)
  // — the standard p-8 wrapper every other admin page gets would waste
  // exactly the screen space a fast tap-to-order grid needs most.
  const isPos = usePathname() === "/admin/pos";

  return (
    <div className="min-h-screen" data-period="dusk">
      <ForceDusk />
      <AdminNav />
      {isPos ? children : <div className="p-8">{children}</div>}
    </div>
  );
}
