import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" data-period="dusk">
      <AdminNav />
      <div className="p-8">{children}</div>
    </div>
  );
}
