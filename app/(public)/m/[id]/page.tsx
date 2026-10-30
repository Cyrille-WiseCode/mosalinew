import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/patterns/empty-state";
import { RetryError } from "@/components/patterns/retry-error";
import { OfferDetail } from "@/features/offers/components/offer-detail";
import { getPublicOffer } from "@/features/offers/queries";
import { uuidSchema } from "@/features/offers/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { m } from "@/lib/messages";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) return { title: "Mission" };
  const res = await getPublicOffer(id);
  return { title: res.ok && res.data ? res.data.title : "Mission" };
}

/** Lien partageable : lecture seule, sans contact du porteur. Les connectés sont envoyés vers la version applicative. */
export default async function PublicOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const back = <Link href="/#offres" className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-2" })}><ArrowLeft aria-hidden="true" />{m.offers.detail.backToList}</Link>;
  if (!uuidSchema.safeParse(id).success) return <>{back}<EmptyState title={m.offers.detail.notFound} /></>;

  if (await getCurrentUser().catch(() => null)) redirect(`/offres/${id}`);
  const res = await getPublicOffer(id);
  if (!res.ok) return <>{back}<RetryError /></>;
  if (!res.data) return <>{back}<EmptyState title={m.offers.detail.notFound} /></>;

  return (
    <>
      {back}
      <OfferDetail
        offer={res.data}
        aside={
          <Card className="grid gap-2 p-5">
            <p className="mb-1 text-sm text-muted-foreground">{m.offers.detail.loginToApply}</p>
            <Link href={`/login?next=/offres/${id}`} className={buttonVariants({ size: "lg" })}>{m.nav.login}</Link>
            <Link href="/register" className={buttonVariants({ variant: "secondary", size: "lg" })}>{m.nav.register}</Link>
          </Card>
        }
      />
    </>
  );
}
