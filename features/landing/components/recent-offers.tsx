import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/patterns/empty-state";
import { RetryError } from "@/components/patterns/retry-error";
import { OfferCard } from "@/features/offers/components/offer-card";
import { getRecentOffers } from "@/features/offers/queries";
import { m } from "@/lib/messages";

export async function RecentOffers() {
  const o = m.landing.offers;
  const res = await getRecentOffers(3);
  return (
    <section id="offres" className="scroll-mt-16 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1140px] px-5 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="mb-2 block text-2xs font-semibold tracking-[0.12em] text-primary">{o.kicker}</span>
            <h2 className="text-xl font-semibold tracking-tight">{o.title}</h2>
            <p className="mt-1 text-base text-muted-foreground">{o.lead}</p>
          </div>
          <Link href="/offres" className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:inline-flex">{o.seeAll}<ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        {!res.ok ? (
          <RetryError title={m.offers.error.title} text={m.offers.error.text} />
        ) : res.data.length === 0 ? (
          <EmptyState title={m.offers.emptyDefault.title} text={m.offers.emptyDefault.text} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {res.data.map((offer) => <OfferCard key={offer.id} offer={offer} href={`/m/${offer.id}`} />)}
          </div>
        )}
      </div>
    </section>
  );
}
