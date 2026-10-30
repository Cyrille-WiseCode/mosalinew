import type { Metadata } from "next";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { safeNext } from "@/features/auth/schemas";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const notice = sp.error === "blocked" ? m.auth.blocked : sp.error === "link" ? m.auth.linkInvalid : sp.logged_out ? m.auth.loggedOut : null;
  return (
    <AuthCard
      title={m.auth.login.title}
      lead={m.auth.login.lead}
      icon={<UserRound className="size-4" aria-hidden="true" />}
      footer={<>{m.auth.login.noAccount} <Link href="/register" className="font-semibold text-primary hover:underline">{m.nav.register}</Link></>}
    >
      {notice && <p role="status" className="mb-4 rounded-md border bg-muted px-3 py-2 text-xs text-muted-foreground">{notice}</p>}
      <LoginForm next={safeNext(sp.next, "/offres")} />
    </AuthCard>
  );
}
