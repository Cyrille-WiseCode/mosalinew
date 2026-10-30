import Link from "next/link";
import { Logo } from "@/components/patterns/logo";
import { m } from "@/lib/messages";

export function SiteFooter() {
  const f = m.landing.footer;
  const link = "text-sm text-white/55 transition-colors hover:text-white";
  return (
    <footer className="grain grain-medium bg-night py-12 text-white/70">
      <div className="mx-auto grid w-full max-w-[1140px] gap-10 px-5 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1.2fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-3 text-sm whitespace-pre-line text-white/55">{m.brand.tagline}</p>
        </div>
        <div className="grid content-start gap-2.5">
          <strong className="text-sm text-white">{f.platform}</strong>
          <Link href="/#offres" className={link}>{m.nav.findMission}</Link>
          <Link href="/mes-offres/nouvelle" className={link}>{m.nav.publish}</Link>
          <Link href="/#fonctionnement" className={link}>{m.nav.howItWorks}</Link>
        </div>
        <div className="grid content-start gap-2.5">
          <strong className="text-sm text-white">{f.resources}</strong>
          <span className={link}>{f.help}</span>
          <span className={link}>{f.trust}</span>
          <span className={link}>{f.contact}</span>
        </div>
        <div className="grid content-start gap-2.5">
          <strong className="text-sm text-white">{f.availableTitle}</strong>
          <p className="text-sm whitespace-pre-line text-white/55">{f.availableText}</p>
        </div>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-[1140px] flex-col gap-2 border-t border-white/10 px-5 pt-5 text-xs text-white/40 sm:flex-row sm:justify-between sm:px-6">
        <span>{f.rights}</span>
        <span className="flex gap-5"><span>{f.privacy}</span><span>{f.terms}</span></span>
      </div>
    </footer>
  );
}
