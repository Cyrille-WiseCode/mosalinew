import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { fromPostgrest } from "@/lib/supabase/errors";
import { failure } from "@/lib/supabase/errors";
import { ok, type Result } from "@/lib/result";
import {
  PAGE_SIZE, type Category, type ContractType, type OfferCardData, type OfferSearchResult, type OfferStatus, type OwnerOffer, type Skill,
} from "./types";
import type { OfferFilters } from "./schemas";

/* Toutes les requêtes Supabase du domaine « offres » passent par ce module (Repository). */

type CardRow = {
  id: string; title: string; description: string | null; category_id: number | null; category_name: string | null;
  budget_min: number | null; budget_max: number | null; duration_days: number | null; contract_type: ContractType | null;
  location: string | null; is_remote: boolean; deadline: string | null; published_at: string | null;
  organization_name: string | null; owner_verified: boolean; skills: string[] | null; applications_count: number;
};

const CARD_COLUMNS =
  "id,title,description,category_id,category_name,budget_min,budget_max,duration_days,contract_type,location,is_remote,deadline,published_at,organization_name,owner_verified,skills,applications_count";

const toCard = (r: CardRow): OfferCardData => ({
  id: r.id, title: r.title, description: r.description, categoryId: r.category_id, categoryName: r.category_name,
  budgetMin: r.budget_min, budgetMax: r.budget_max, durationDays: r.duration_days, contractType: r.contract_type,
  location: r.location, isRemote: r.is_remote, deadline: r.deadline, publishedAt: r.published_at,
  organizationName: r.organization_name, ownerVerified: r.owner_verified, skills: r.skills ?? [], applicationsCount: r.applications_count,
});

export const getCategories = cache(async (): Promise<Result<Category[]>> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id,slug,name").order("sort_order");
  if (error) return fromPostgrest(error);
  return ok(data as Category[]);
});

export const getSkills = cache(async (): Promise<Result<Skill[]>> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("skills").select("id,slug,name,category_id").order("name");
  if (error) return fromPostgrest(error);
  return ok((data ?? []).map((s) => ({ id: s.id as number, slug: s.slug as string, name: s.name as string, categoryId: s.category_id as number | null })));
});

/** Retire tout caractère pouvant casser la grammaire des filtres PostgREST (virgules, parenthèses, jokers…). */
const sanitizeTerm = (s: string) => s.replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ").trim();

/** UC-3 : offres actives (exposition garantie par la vue offer_cards), filtrées, paginées côté serveur. */
export async function searchOffers(filters: OfferFilters): Promise<Result<OfferSearchResult>> {
  const supabase = await createClient();
  const from = (filters.page - 1) * PAGE_SIZE;

  let query = supabase.from("offer_cards").select(CARD_COLUMNS, { count: "exact" });

  const term = filters.q ? sanitizeTerm(filters.q) : "";
  if (term) query = query.or(`title.ilike.%${term}%,search.wfts(french).${term}`);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.contract) query = query.eq("contract_type", filters.contract);
  // Chevauchement de fourchettes : l'offre convient si son intervalle croise celui demandé.
  if (filters.budgetMin != null) query = query.gte("budget_max", filters.budgetMin);
  if (filters.budgetMax != null) query = query.lte("budget_min", filters.budgetMax);
  if (filters.remote) query = query.eq("is_remote", true);
  const loc = filters.location ? sanitizeTerm(filters.location) : "";
  if (loc) query = query.ilike("location", `%${loc}%`);

  const { data, count, error } = await query.order("published_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (error) return fromPostgrest(error);
  return ok({ items: (data as CardRow[]).map(toCard), total: count ?? 0, page: filters.page, pageSize: PAGE_SIZE });
}

export async function getRecentOffers(limit = 3): Promise<Result<OfferCardData[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("offer_cards").select(CARD_COLUMNS).order("published_at", { ascending: false }).limit(limit);
    if (error) return fromPostgrest(error);
    return ok((data as CardRow[]).map(toCard));
  } catch {
    return failure("NETWORK");
  }
}

export const getPublicOffer = cache(async (id: string): Promise<Result<OfferCardData | null>> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("offer_cards").select(CARD_COLUMNS).eq("id", id).maybeSingle();
  if (error) return fromPostgrest(error);
  return ok(data ? toCard(data as CardRow) : null);
});

type OwnerRow = {
  id: string; title: string; description: string | null; category_id: number | null; budget_min: number | null;
  budget_max: number | null; duration_days: number | null; contract_type: ContractType | null; location: string | null;
  is_remote: boolean; deadline: string | null; status: OfferStatus; published_at: string | null; closed_at: string | null;
  is_moderated: boolean; moderation_reason: string | null; updated_at: string; offer_skills: { skill_id: number }[] | null;
};
const OWNER_COLUMNS =
  "id,title,description,category_id,budget_min,budget_max,duration_days,contract_type,location,is_remote,deadline,status,published_at,closed_at,is_moderated,moderation_reason,updated_at,offer_skills(skill_id)";

const toOwner = (r: OwnerRow): OwnerOffer => ({
  id: r.id, title: r.title, description: r.description, categoryId: r.category_id, budgetMin: r.budget_min,
  budgetMax: r.budget_max, durationDays: r.duration_days, contractType: r.contract_type, location: r.location,
  isRemote: r.is_remote, deadline: r.deadline, status: r.status, publishedAt: r.published_at, closedAt: r.closed_at,
  isModerated: r.is_moderated, moderationReason: r.moderation_reason, updatedAt: r.updated_at,
  skillIds: (r.offer_skills ?? []).map((s) => s.skill_id),
});

/** Offres du porteur courant (RLS : owner_id = auth.uid()). */
export async function getMyOffers(ownerId: string): Promise<Result<OwnerOffer[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("offers").select(OWNER_COLUMNS).eq("owner_id", ownerId).order("updated_at", { ascending: false }).limit(100);
  if (error) return fromPostgrest(error);
  return ok((data as unknown as OwnerRow[]).map(toOwner));
}

export const getMyOffer = cache(async (id: string, ownerId: string): Promise<Result<OwnerOffer | null>> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("offers").select(OWNER_COLUMNS).eq("id", id).eq("owner_id", ownerId).maybeSingle();
  if (error) return fromPostgrest(error);
  return ok(data ? toOwner(data as unknown as OwnerRow) : null);
});

/** Nombre de candidatures en attente (0 tant que le Package 3 n'existe pas). */
export async function getPendingApplications(offerId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("offer_application_stats").select("pending_count").eq("offer_id", offerId).maybeSingle();
  return (data?.pending_count as number | undefined) ?? 0;
}

/** Infos de modération d'une offre (lisibles par modérateur / super_admin via RLS). */
export async function getModerationInfo(id: string): Promise<{ status: OfferStatus; isModerated: boolean; reason: string | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("offers").select("status,is_moderated,moderation_reason").eq("id", id).maybeSingle();
  return data ? { status: data.status as OfferStatus, isModerated: data.is_moderated as boolean, reason: data.moderation_reason as string | null } : null;
}

/** Candidatures en attente par offre (une seule requête pour la liste « Mes offres »). */
export async function getPendingCounts(offerIds: string[]): Promise<Record<string, number>> {
  if (offerIds.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("offer_application_stats").select("offer_id,pending_count").in("offer_id", offerIds);
  return Object.fromEntries((data ?? []).map((r) => [r.offer_id as string, r.pending_count as number]));
}

/** Offre telle que vue par un modérateur (RLS : tous statuts). */
export async function getOfferAsModerator(id: string): Promise<OwnerOffer | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("offers").select(OWNER_COLUMNS).eq("id", id).maybeSingle();
  return data ? toOwner(data as unknown as OwnerRow) : null;
}
