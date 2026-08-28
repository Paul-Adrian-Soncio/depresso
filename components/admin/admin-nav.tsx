"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Menu" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between border-b border-line px-8 py-4">
      <div className="flex items-center gap-6">
        <span className="font-display text-sm font-bold tracking-[-0.02em] text-ink">
          Depresso · Admin
        </span>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors duration-base ${
                  isActive ? "bg-accent text-on-accent" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2"
        >
          Log out
        </button>
      </form>
    </nav>
  );
}
