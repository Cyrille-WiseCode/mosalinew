import Image from "next/image";
import { HeroSearch } from "./hero-search";
import { m } from "@/lib/messages";
import type { Category } from "@/features/offers/types";

export function Hero({ categories }: { categories: Category[] }) {
  const l = m.landing;
  return (
    <section id="accueil" className="relative flex min-h-[620px] items-center overflow-hidden text-white">
      <Image src="https://images.unsplash.com/photo-1655720357872-ce227e4164ba?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1800" alt={l.heroAlt} fill priority sizes="100vw" className="object-cover object-[center_45%]" />
      <div className="absolute inset-0 bg-[hsl(228_30%_8%/0.74)]" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-[1140px] px-5 pt-24 pb-14 sm:px-6">
        <div className="max-w-[620px]">
          <span className="grain grain-medium inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-2.5 py-1 text-2xs font-semibold tracking-[0.1em] uppercase backdrop-blur">
            <i className="size-1.5 rounded-full bg-[hsl(238_45%_78%)]" aria-hidden="true" />{l.kicker}
          </span>
          <h1 className="mt-5 text-display font-semibold tracking-[-0.03em]">
            {l.title}<br /><span className="text-[hsl(238_45%_80%)]">{l.titleAccent}</span>
          </h1>
          <p className="mt-4 max-w-[520px] text-base leading-7 text-white/75">{l.lead}</p>
        </div>
        <HeroSearch categories={categories} />
      </div>
    </section>
  );
}
