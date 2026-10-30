import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { m } from "@/lib/messages";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans-family", display: "swap" });

export const metadata: Metadata = {
  title: { default: "MOSALI — Les bons talents. Les bons projets.", template: "%s · MOSALI" },
  description: "MOSALI connecte les entreprises d’Afrique francophone aux meilleurs indépendants, dans un cadre simple et fiable.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth"suppressHydrationWarning className={sans.variable}>
      <body>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
          {m.common.skipToContent}
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
