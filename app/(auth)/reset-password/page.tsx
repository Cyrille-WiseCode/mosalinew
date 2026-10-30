import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetForm } from "@/features/auth/components/reset-form";
import { getCurrentUser } from "@/lib/auth/session";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  return (
    <AuthCard title={m.auth.reset.title} lead={user ? m.auth.reset.lead : m.auth.linkInvalid} icon={<KeyRound className="size-4" aria-hidden="true" />}>
      {user ? <ResetForm /> : <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">{m.auth.forgot.title}</Link>}
    </AuthCard>
  );
}
