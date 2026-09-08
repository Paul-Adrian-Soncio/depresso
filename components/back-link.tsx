import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * The "back to the site" link on its own, for pages without a static title
 * block to pair it with (e.g. order status, whose heading is generated
 * dynamically inside OrderStatus). PageHeader uses this internally too.
 */
export function BackLink({ href = "/", label = "Back to the site" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-3 transition-colors duration-base hover:text-ink-2"
    >
      <ArrowLeft size={13} />
      {label}
    </Link>
  );
}
