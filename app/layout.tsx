import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader, DM_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Depresso",
  description: "A lofi coffee shop that only exists on the internet.",
};

/**
 * Genuinely global only: fonts, the required <html>/<body> tags, a fixed
 * default data-period. The LIVE period (PeriodProvider, PeriodSync, the
 * visitor-clock-driven data-period value) lives in app/(site)/layout.tsx
 * instead — this root layout is mandatory and wraps every route including
 * /admin, so anything that changes with the time of day has to stay out of
 * it or it bleeds into the admin section, which needs a fixed palette.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-period="dusk"
      className={`${bricolage.variable} ${newsreader.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
