import type { Metadata } from "next";
import { OfferCard } from "@/features/offers/components/offer-card";
import { OfferFilters } from "@/features/offers/components/offer-filters";
import { filtersToSearchParams, parseOfferFilters } from "@/features/offers/schemas";
import { getCategories, searchOffers } from "@/features/offers/queries";
import { EmptyState } from "@/components/patterns/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { Pagination } from "@/components/patterns/pagination";
import { RetryError } from "@/components/patterns/retry-error";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Offres de mission" };

export default async function OffersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { filters, errors } = parseOfferFilters(await searchParams);
  const [categories, result] = await Promise.all([getCategories(), searchOffers(filters)]);
  const hasFilters = Object.keys(filters).some((k) => k !== "page");

  return (
    <>
      <PageHeader title={m.offers.pageTitle} description={m.offers.pageLead} />
      <OfferFilters categories={categories.ok ? categories.data : []} initial={filters} />
      {errors.length > 0 && (
        <ul role="alert" className="mb-4 grid gap-1 rounded-md border border-destructive/20 bg-destructive-soft px-3 py-2 text-xs text-destructive">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      {!result.ok ? (
        <RetryError title={m.offers.error.title} text={m.offers.error.text} />
      ) : result.data.items.length === 0 ? (
        <EmptyState title={hasFilters ? m.offers.empty.title : m.offers.emptyDefault.title} text={hasFilters ? m.offers.empty.text : m.offers.emptyDefault.text} />
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">{m.offers.resultCount(result.data.total)}</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {result.data.items.map((o) => <OfferCard key={o.id} offer={o} href={`/offres/${o.id}`} />)}
          </div>
          <Pagination
            page={result.data.page}
            totalPages={Math.max(1, Math.ceil(result.data.total / result.data.pageSize))}
            hrefFor={(p) => `/offres${filtersToSearchParams(filters, p)}`}
          />
        </>
      )}
    </>
  );
}
