"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fromAuth, failure } from "@/lib/supabase/errors";
import { getSiteUrl } from "@/lib/env";
import { run } from "@/lib/actions";
import { ok, type Result } from "@/lib/result";
import { forgotSchema, loginSchema, registerSchema, resetSchema, safeNext, type ForgotValues, type LoginValues, type RegisterValues, type ResetValues } from "./schemas";

const invalid = (error: { issues: { path: PropertyKey[]; message: string }[] }): Result<never> => {
  const fieldErrors: Record<string, string[]> = {};
  for (const i of error.issues) (fieldErrors[String(i.path[0] ?? "form")] ||= []).push(i.message);
  return failure("VALIDATION", { fieldErrors });
};

export async function loginAction(values: LoginValues, next?: string): Promise<Result<{ redirectTo: string }>> {
  return run("auth.login", async () => {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) return invalid(parsed.error);
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return fromAuth(error);

    // Compte bloqué : refus immédiat (le proxy et la RLS font de même).
    const { data: profile } = await supabase.from("profiles").select("is_blocked").eq("id", data.user.id).maybeSingle();
    if (profile?.is_blocked) {
      await supabase.auth.signOut();
      return failure("ACCOUNT_BLOCKED");
    }
    return ok({ redirectTo: safeNext(next) });
  });
}

export async function registerAction(values: RegisterValues): Promise<Result<{ email: string }>> {
  return run("auth.register", async () => {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) return invalid(parsed.error);
    const { email, password, fullName, casquette } = parsed.data;
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/offres`,
        // app_role / identity_status ne sont jamais lus depuis ces métadonnées (cf. trigger SQL).
        data: { full_name: fullName, active_casquette: casquette },
      },
    });
    if (error) return fromAuth(error);
    return ok({ email });
  });
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?logged_out=1");
}

/** Réponse identique que le compte existe ou non (pas d'énumération d'utilisateurs). */
export async function forgotPasswordAction(values: ForgotValues): Promise<Result<void>> {
  return run("auth.forgot", async () => {
    const parsed = forgotSchema.safeParse(values);
    if (!parsed.success) return invalid(parsed.error);
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
    });
    if (error && (error.status === 429 || error.code?.startsWith("over_"))) return fromAuth(error);
    return ok(undefined);
  });
}

export async function resetPasswordAction(values: ResetValues): Promise<Result<void>> {
  return run("auth.reset", async () => {
    const parsed = resetSchema.safeParse(values);
    if (!parsed.success) return invalid(parsed.error);
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return error.code === "same_password" ? failure("WEAK_PASSWORD") : error.status === 401 || error.code === "session_not_found" ? failure("UNAUTHENTICATED") : fromAuth(error);
    return ok(undefined);
  });
}
