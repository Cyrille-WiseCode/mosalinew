import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/patterns/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Vérification d’identité" };

// Étape 7 du plan : dépôt de pièces, file de modération. Page volontairement minimale ici.
export default function VerificationPage() {
  return (
    <>
      <PageHeader title={m.verification.title} />
      <EmptyState icon={ShieldCheck} title={m.verification.soon} text={m.verification.lead} />
    </>
  );
}
