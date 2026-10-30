import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BudgetRange } from "@/components/patterns/money";
import { PageHeader } from "@/components/patterns/page-header";
import { RetryError } from "@/components/patterns/retry-error";
import { StatusBadge } from "@/components/patterns/status-badge";
import { OfferEditor } from "@/features/offers/components/offer-editor";
import { getCategories, getMyOffer, getPendingApplications, getSkills } from "@/features/offers/queries";
import { uuidSchema } from "@/features/offers/schemas";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Modifier l’offre" };

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/mes-offres/${id}`);
  if (!uuidSchema.safeParse(id).success) notFound();

  const [offerRes, categories, skills] = await Promise.all([getMyOffer(id, user.id), getCategories(), getSkills()]);
  if (!offerRes.ok || !categories.ok || !skills.ok) return <RetryError />;
  const offer = offerRes.data;
  if (!offer) notFound();

  const back = <Link href="/mes-offres" className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-2" })}><ArrowLeft aria-hidden="true" />{m.nav.myOffers}</Link>;

  // Offre terminée (pourvue, annulée, expirée) : lecture seule.
  if (offer.status !== "draft" && offer.status !== "active") {
    return (
      <>
        {back}
        <PageHeader title={offer.title} actions={<StatusBadge kind="offer" status={offer.status} />} />
        <Card className="grid max-w-3xl gap-3 p-6 text-sm">
          {offer.isModerated && offer.moderationReason && <p className="rounded-md border border-destructive/20 bg-destructive-soft px-3 py-2 text-destructive">{m.offers.moderation.moderatedBadge} — {offer.moderationReason}</p>}
          <p className="text-base leading-7 whitespace-pre-line">{offer.description}</p>
          <p className="text-muted-foreground"><BudgetRange min={offer.budgetMin} max={offer.budgetMax} /> · {formatDate(offer.deadline)}</p>
        </Card>
      </>
    );
  }

  const pending = offer.status === "active" ? await getPendingApplications(id) : 0;
  return (
    <>
      {back}
      <OfferEditor key={offer.status} offer={offer} categories={categories.data} skills={skills.data} identityStatus={user.identityStatus} pendingCount={pending} />
    </>
  );
}
