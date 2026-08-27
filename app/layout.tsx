import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader, DM_Mono } from "next/font/google";
import { getPeriod } from "@/lib/period";
import { PeriodSync } from "@/components/period-sync";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { period, hasCookie } = await getPeriod();

  return (
    <html
      lang="en"
      data-period={period}
      className={`${bricolage.variable} ${newsreader.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <PeriodSync hasCookie={hasCookie} />
        {children}
      </body>
    </html>
  );
}
