import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <AuthCard
      title={m.auth.register.title}
      lead={m.auth.register.lead}
      icon={<UserPlus className="size-4" aria-hidden="true" />}
      footer={<>{m.auth.register.hasAccount} <Link href="/login" className="font-semibold text-primary hover:underline">{m.nav.login}</Link></>}
    >
      <RegisterForm defaultCasquette={sp.role === "porteur" ? "porteur" : "freelance"} />
    </AuthCard>
  );
}
