import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { m } from "@/lib/messages";

export function CtaBand() {
  const c = m.landing.cta;
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto w-full max-w-[1140px] px-5 sm:px-6">
        <div className="grain grain-strong relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-lg bg-night px-6 py-9 text-white sm:flex-row sm:items-center sm:px-10">
          <div className="relative">
            <span className="mb-2 block text-2xs font-semibold tracking-[0.12em] text-[hsl(238_40%_76%)]">{c.kicker}</span>
            <h2 className="text-xl font-semibold tracking-tight">{c.title}</h2>
            <p className="mt-1 text-base text-white/60">{c.lead}</p>
          </div>
          <Link href="/mes-offres/nouvelle" className={buttonVariants({ variant: "light", size: "lg", className: "relative w-full sm:w-auto" })}>
            {m.nav.publish}<ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
