import { Suspense } from "react";
import { SiteHeader } from "@/features/landing/components/site-header";
import { Hero } from "@/features/landing/components/hero";
import { TrustStrip } from "@/features/landing/components/trust-strip";
import { RecentOffers } from "@/features/landing/components/recent-offers";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { CtaBand } from "@/features/landing/components/cta-band";
import { SiteFooter } from "@/features/landing/components/site-footer";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/features/offers/queries";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LandingPage() {
  const [user, categories] = await Promise.all([getCurrentUser().catch(() => null), getCategories().catch(() => null)]);
  return (
    <>
      <SiteHeader loggedIn={!!user} overlay />
      <main id="contenu">
        <Hero categories={categories?.ok ? categories.data : []} />
        <TrustStrip />
        <Suspense
          fallback={
            <div className="mx-auto grid max-w-[1140px] gap-3 px-5 py-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
            </div>
          }
        >
          <RecentOffers />
        </Suspense>
        <HowItWorks />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
