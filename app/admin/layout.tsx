import { DesktopOnlyGate } from "@/components/admin/desktop-only-gate";

/**
 * The one layout shared by both /admin/login and the authenticated
 * (dashboard) group — the desktop-only gate has to sit here rather than in
 * (dashboard)'s own layout so it also covers the login page itself
 * (nobody on a phone should even see the demo password, let alone the
 * dashboard behind it).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopOnlyGate />
      {children}
    </>
  );
}
