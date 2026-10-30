import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Casquette, IdentityStatus } from "@/features/profiles/types";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  appRole: AppRole;
  casquette: Casquette;
  identityStatus: IdentityStatus;
  isBlocked: boolean;
};

/** Mémoïsé par requête : un seul aller-retour même si plusieurs composants l'appellent. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const id = claims?.claims?.sub;
  if (!id) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, app_role, active_casquette, identity_status, is_blocked")
    .eq("id", id)
    .maybeSingle();
  if (!profile) return null;

  return {
    id,
    email: (claims?.claims?.email as string | undefined) ?? "",
    fullName: profile.full_name as string,
    appRole: profile.app_role as AppRole,
    casquette: profile.active_casquette as Casquette,
    identityStatus: profile.identity_status as IdentityStatus,
    isBlocked: profile.is_blocked as boolean,
  };
});

export async function requireUser(next?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  if (user.isBlocked) redirect("/login?error=blocked");
  return user;
}

export const isModerator = (u: CurrentUser | null) => u?.appRole === "moderator" || u?.appRole === "super_admin";
