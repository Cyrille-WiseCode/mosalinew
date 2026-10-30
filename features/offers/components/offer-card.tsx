import Link from "next/link";
import { ArrowRight, CalendarClock, MapPin, Timer, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge, VerifiedMark } from "@/components/patterns/verified-badge";
import { BudgetRange } from "@/components/patterns/money";
import { formatDate, formatDuration } from "@/lib/format";
import { m } from "@/lib/messages";
import type { OfferCardData } from "../types";
import { CategoryIcon } from "./category-icon";

/** Carte d'offre (liste publique, landing, explorateur). `href` fixe la destination selon le contexte. */
export function OfferCard({ offer, href }: { offer: OfferCardData; href: string }) {
  const place = [offer.isRemote ? m.remote : null, offer.location].filter(Boolean).join(" · ");
  const duration = formatDuration(offer.durationDays);
  return (
    <article className="glass grain grain-soft group flex min-w-0 flex-col rounded-lg p-5 shadow-z1 transition-[transform,box-shadow] duration-[160ms] ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:shadow-z2">
      <div className="mb-4 flex items-start justify-between gap-3">
        <CategoryIcon name={offer.categoryName} />
        {offer.ownerVerified && <VerifiedBadge />}
      </div>

      <h3 className="text-base font-semibold leading-snug tracking-tight">
        <Link href={href} className="after:absolute after:inset-0 hover:text-primary focus-visible:outline-offset-4">{offer.title}</Link>
      </h3>
      {offer.organizationName && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {offer.organizationName}
          {offer.ownerVerified && <VerifiedMark />}
        </p>
      )}

      {offer.description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>}

      <dl className="mt-4 grid gap-2 border-y py-3 text-sm">
        <div className="flex items-center gap-2"><Wallet className="size-4 text-muted-foreground" aria-hidden="true" /><dt className="sr-only">{m.offers.detail.budget}</dt><dd><BudgetRange min={offer.budgetMin} max={offer.budgetMax} /></dd></div>
        {duration && <div className="flex items-center gap-2"><Timer className="size-4 text-muted-foreground" aria-hidden="true" /><dt className="sr-only">{m.offers.detail.duration}</dt><dd>{duration}</dd></div>}
        {place && <div className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" aria-hidden="true" /><dt className="sr-only">{m.offers.detail.location}</dt><dd>{place}</dd></div>}
      </dl>

      {offer.skills.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={m.offers.detail.skills}>
          {offer.skills.slice(0, 4).map((s) => <li key={s}><Badge>{s}</Badge></li>)}
          {offer.skills.length > 4 && <li><Badge>+{offer.skills.length - 4}</Badge></li>}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between pt-4 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {offer.deadline && <><CalendarClock className="size-3.5" aria-hidden="true" />{formatDate(offer.deadline)}</>}
        </span>
        <span className="flex items-center gap-1.5 font-medium text-primary">{m.offers.card.viewMission}<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
      </div>
    </article>
  );
}
