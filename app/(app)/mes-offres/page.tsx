import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Plus, ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/patterns/data-table";
import { BudgetRange } from "@/components/patterns/money";
import { EmptyState } from "@/components/patterns/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { RetryError } from "@/components/patterns/retry-error";
import { StatusBadge } from "@/components/patterns/status-badge";
import { OfferActions } from "@/features/offers/components/offer-actions";
import { getMyOffers, getPendingCounts } from "@/features/offers/queries";
import type { OwnerOffer } from "@/features/offers/types";
import { CasquetteSwitcher } from "@/features/profiles/components/casquette-switcher";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Mes offres" };

export default async function MyOffersPage() {
  const user = await requireUser("/mes-offres");
  if (user.casquette !== "porteur") {
    return (
      <>
        <PageHeader title={m.offers.mine.pageTitle} />
        <EmptyState icon={Briefcase} title={m.offers.mine.needPorteur.title} text={m.offers.mine.needPorteur.text} action={<CasquetteSwitcher current={user.casquette} className="w-56" />} />
      </>
    );
  }

  const res = await getMyOffers(user.id);
  const counts = res.ok ? await getPendingCounts(res.data.map((o) => o.id)) : {};
  const t = m.offers.mine.columns;

  const columns: Column<OwnerOffer>[] = [
    { key: "title", header: t.title, className: "max-w-[280px]", cell: (o) => <Link href={`/mes-offres/${o.id}`} className="line-clamp-2 font-medium hover:text-primary">{o.title}</Link> },
    { key: "status", header: t.status, cell: (o) => <StatusBadge kind="offer" status={o.status} /> },
    { key: "budget", header: t.budget, cell: (o) => <BudgetRange min={o.budgetMin} max={o.budgetMax} /> },
    { key: "deadline", header: t.deadline, cell: (o) => formatDate(o.deadline) },
    { key: "updated", header: t.updated, cell: (o) => <span className="text-muted-foreground">{formatDate(o.updatedAt)}</span> },
    { key: "actions", header: t.actions, cell: (o) => <OfferActions offer={o} pendingCount={counts[o.id] ?? 0} /> },
  ];

  return (
    <>
      <PageHeader
        title={m.offers.mine.pageTitle}
        description={m.offers.mine.pageLead}
        actions={<Link href="/mes-offres/nouvelle" className={buttonVariants()}><Plus aria-hidden="true" />{m.offers.mine.create}</Link>}
      />
      {user.identityStatus !== "approved" && (
        <p role="note" className="mb-5 flex flex-wrap items-center gap-2 rounded-md border border-warning/25 bg-warning-soft px-3 py-2.5 text-sm text-warning">
          <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />{m.offers.mine.verifyBanner}
          <Link href="/verification" className="font-semibold underline underline-offset-2">{m.offers.mine.verifyCta}</Link>
        </p>
      )}
      {!res.ok ? (
        <RetryError />
      ) : res.data.length === 0 ? (
        <EmptyState icon={Briefcase} title={m.offers.mine.empty.title} text={m.offers.mine.empty.text} action={<Link href="/mes-offres/nouvelle" className={buttonVariants()}><Plus aria-hidden="true" />{m.offers.mine.create}</Link>} />
      ) : (
        <DataTable caption={m.offers.mine.pageTitle} columns={columns} rows={res.data} rowKey={(o) => o.id} />
      )}
    </>
  );
}
