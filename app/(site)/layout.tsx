import { getPeriod } from "@/lib/period";
import { PeriodProvider } from "@/components/period-provider";
import { PeriodSync } from "@/components/period-sync";

/**
 * The live time-of-day system (PeriodProvider, PeriodSync) is scoped to
 * the public site only — it mutates <html data-period> imperatively via
 * document.documentElement, so keeping it out of the root layout (which
 * also wraps /admin) means the admin section never sees the live-changing
 * period at all, rather than fighting it with a lower-specificity override.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { period, hasCookie } = await getPeriod();

  return (
    <PeriodProvider initial={period}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <PeriodSync hasCookie={hasCookie} />
      {children}
    </PeriodProvider>
  );
}
