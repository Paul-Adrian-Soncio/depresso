import { AdminNav } from "@/components/admin/admin-nav";
import { ForceDusk } from "@/components/admin/force-dusk";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" data-period="dusk">
      <ForceDusk />
      <AdminNav />
      <div className="p-8">{children}</div>
    </div>
  );
}
