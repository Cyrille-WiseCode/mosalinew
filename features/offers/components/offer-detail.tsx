import { CalendarClock, MapPin, Timer, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VerifiedBadge, VerifiedMark } from "@/components/patterns/verified-badge";
import { BudgetRange } from "@/components/patterns/money";
import { formatDate, formatDuration } from "@/lib/format";
import { m } from "@/lib/messages";
import type { OfferCardData } from "../types";
import { CategoryIcon } from "./category-icon";

/** Détail d'une offre active : contenu seul, la zone d'action (CTA / modération) est injectée. */
export function OfferDetail({ offer, aside }: { offer: OfferCardData; aside?: React.ReactNode }) {
  const place = [offer.isRemote ? m.remote : null, offer.location].filter(Boolean).join(" · ");
  const duration = formatDuration(offer.durationDays);
  const d = m.offers.detail;
  const facts: { icon: typeof Wallet; label: string; value: React.ReactNode }[] = [
    { icon: Wallet, label: d.budget, value: <BudgetRange min={offer.budgetMin} max={offer.budgetMax} /> },
    ...(duration ? [{ icon: Timer, label: d.duration, value: duration }] : []),
    ...(place ? [{ icon: MapPin, label: d.location, value: place }] : []),
    ...(offer.deadline ? [{ icon: CalendarClock, label: d.deadline, value: formatDate(offer.deadline) }] : []),
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="grid gap-5">
        <Card className="p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <CategoryIcon name={offer.categoryName} />
            {offer.ownerVerified && <VerifiedBadge />}
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{offer.title}</h1>
          {offer.organizationName && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              {d.by} {offer.organizationName} {offer.ownerVerified && <VerifiedMark />}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {offer.categoryName && <Badge tone="accent">{offer.categoryName}</Badge>}
            {offer.contractType && <Badge>{m.contract[offer.contractType]}</Badge>}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">{d.description}</h2>
          <p className="max-w-[68ch] text-base leading-7 whitespace-pre-line text-foreground/90">{offer.description || "—"}</p>
        </Card>

        {offer.skills.length > 0 && (
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">{d.skills}</h2>
            <ul className="flex flex-wrap gap-1.5">{offer.skills.map((s) => <li key={s}><Badge>{s}</Badge></li>)}</ul>
          </Card>
        )}
      </div>

      <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
        <Card className="p-5">
          <dl className="grid gap-3.5">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-0.5 text-sm font-medium">{value}</dd></div>
              </div>
            ))}
          </dl>
        </Card>
        {aside}
      </aside>
    </div>
  );
}
