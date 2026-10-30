import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/patterns/empty-state";
import { RetryError } from "@/components/patterns/retry-error";
import { StatusBadge } from "@/components/patterns/status-badge";
import { OfferDetail } from "@/features/offers/components/offer-detail";
import { ModerationPanel } from "@/features/offers/components/moderation-panel";
import { getOfferAsModerator, getPublicOffer } from "@/features/offers/queries";
import { uuidSchema } from "@/features/offers/schemas";
import { isModerator, requireUser } from "@/lib/auth/session";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Mission" };

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/offres/${id}`);
  const moderator = isModerator(user);
  const back = (
    <Link href="/offres" className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-2" })}>
      <ArrowLeft aria-hidden="true" />{m.offers.detail.backToList}
    </Link>
  );

  if (!uuidSchema.safeParse(id).success) return <>{back}<EmptyState title={m.offers.detail.notFound} /></>;
  const res = await getPublicOffer(id);
  if (!res.ok) return <>{back}<RetryError /></>;

  if (!res.data) {
    // Offre non active : seuls les modérateurs peuvent la consulter (RLS) pour la rétablir.
    const removed = moderator ? await getOfferAsModerator(id) : null;
    if (!removed) return <>{back}<EmptyState title={m.offers.detail.notFound} /></>;
    return (
      <>
        {back}
        <div className="grid max-w-3xl gap-4">
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-2"><StatusBadge kind="offer" status={removed.status} />{removed.isModerated && <span className="text-xs text-muted-foreground">{m.offers.moderation.moderatedBadge}</span>}</div>
            <h1 className="text-xl font-semibold tracking-tight">{removed.title}</h1>
            {removed.moderationReason && <p className="mt-2 text-sm text-muted-foreground">{removed.moderationReason}</p>}
            <p className="mt-4 text-base leading-7 whitespace-pre-line">{removed.description}</p>
          </Card>
          {removed.status === "cancelled" && removed.isModerated && <ModerationPanel offerId={id} mode="removed" canRestore={user.appRole === "super_admin"} />}
        </div>
      </>
    );
  }

  return (
    <>
      {back}
      <OfferDetail
        offer={res.data}
        aside={
          <>
            <Card className="p-5">
              <Button className="w-full" size="lg" disabled><Clock aria-hidden="true" />{m.offers.detail.applySoon}</Button>
              <p className="mt-2.5 text-center text-xs text-muted-foreground">{m.offers.detail.applyHint}</p>
            </Card>
            {moderator && <ModerationPanel offerId={id} mode="active" canRestore={false} />}
          </>
        }
      />
    </>
  );
}
