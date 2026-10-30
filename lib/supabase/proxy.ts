import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

const PROTECTED_PREFIXES = ["/offres", "/mes-offres", "/profil", "/verification"];
const GUEST_ONLY = ["/login", "/register", "/forgot-password"];

const startsWithAny = (path: string, list: string[]) => list.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Rafraîchit la session, protège les routes, bloque les comptes `is_blocked`.
 * Doublé par la RLS (le proxy n'est JAMAIS la seule barrière).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Supabase injoignable : on traite la requête comme anonyme plutôt que de renvoyer une 500.
  let userId: string | null = null;
  try {
    const { data } = await supabase.auth.getClaims();
    userId = data?.claims?.sub ?? null;
  } catch {
    userId = null;
  }
  const path = request.nextUrl.pathname;

  const redirect = (to: string, params?: Record<string, string>) => {
    const target = request.nextUrl.clone();
    target.pathname = to;
    target.search = "";
    Object.entries(params ?? {}).forEach(([k, v]) => target.searchParams.set(k, v));
    const res = NextResponse.redirect(target);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!userId) {
    if (startsWithAny(path, PROTECTED_PREFIXES)) {
      return redirect("/login", { next: path + request.nextUrl.search });
    }
    return response;
  }

  // Compte bloqué : déconnexion immédiate (première barrière ; la RLS est la seconde).
  const profile = await supabase.from("profiles").select("is_blocked").eq("id", userId).maybeSingle().then((r) => r.data, () => null);
  if (profile?.is_blocked) {
    await supabase.auth.signOut();
    return redirect("/login", { error: "blocked" });
  }

  if (startsWithAny(path, GUEST_ONLY)) return redirect("/offres");
  return response;
}
