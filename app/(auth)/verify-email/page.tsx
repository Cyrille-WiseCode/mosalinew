import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Vérifiez votre e-mail" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { email } = await searchParams;
  return (
    <AuthCard
      title={m.auth.verifyEmail.title}
      lead={email ? m.auth.verifyEmail.lead(email) : m.auth.verifyEmail.leadNoEmail}
      icon={<MailCheck className="size-4" aria-hidden="true" />}
      footer={<Link href="/login" className="font-semibold text-primary hover:underline">{m.auth.verifyEmail.backToLogin}</Link>}
    >
      <p className="text-sm text-muted-foreground">{m.auth.verifyEmail.hint}</p>
    </AuthCard>
  );
}
