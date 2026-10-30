import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/patterns/page-header";
import { CreateOfferForm } from "@/features/offers/components/create-offer-form";
import { requireUser } from "@/lib/auth/session";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Nouvelle offre" };

export default async function NewOfferPage() {
  const user = await requireUser("/mes-offres/nouvelle");
  if (user.casquette !== "porteur") redirect("/mes-offres"); // la page explique comment changer de casquette
  return (
    <>
      <PageHeader title={m.offers.form.createTitle} description={m.offers.form.createLead} />
      <Card className="p-6"><CreateOfferForm /></Card>
    </>
  );
}
