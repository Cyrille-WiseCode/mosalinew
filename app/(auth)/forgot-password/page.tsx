import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotForm } from "@/features/auth/components/forgot-form";
import { m } from "@/lib/messages";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title={m.auth.forgot.title} lead={m.auth.forgot.lead} icon={<KeyRound className="size-4" aria-hidden="true" />} footer={<Link href="/login" className="font-semibold text-primary hover:underline">{m.auth.verifyEmail.backToLogin}</Link>}>
      <ForgotForm />
    </AuthCard>
  );
}
