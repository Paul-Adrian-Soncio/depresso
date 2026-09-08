"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, KeyRound, FileText, UtensilsCrossed, Coffee, Pin } from "lucide-react";
import { SlideOverPanel } from "@/components/slide-over-panel";

const LINKS = [
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/queue", label: "Pickup screen", icon: Coffee },
  { href: "/corkboard", label: "Corkboard", icon: Pin },
  { href: "/case-study", label: "Case study", icon: FileText },
  { href: "/admin", label: "Admin", icon: KeyRound },
];

/**
 * The homepage header's five links plus the period switcher overflow a
 * narrow viewport with no wrapping, which just clips off-screen instead of
 * reflowing. Below `lg` this replaces the inline link row with a single
 * trigger that opens the same links in a slide-in drawer — same
 * self-contained open/closed-state-plus-overlay shape as CartDrawer.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex items-center justify-center rounded-md border border-line bg-surface p-2 text-ink-3 transition-colors duration-base hover:text-ink-2 lg:hidden"
      >
        <Menu size={16} />
      </button>

      <SlideOverPanel
        open={open}
        onClose={() => setOpen(false)}
        className="lg:hidden"
        panelClassName="max-w-xs"
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold tracking-[-0.02em] text-ink">
            Depresso
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-3 transition-colors duration-base hover:text-ink-2"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-3 font-mono text-xs uppercase tracking-[0.1em] text-ink-2 transition-colors duration-base hover:bg-surface hover:text-ink"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
      </SlideOverPanel>
    </>
  );
}
