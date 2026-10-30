"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fromPostgrest, failure } from "@/lib/supabase/errors";
import { getCurrentUser } from "@/lib/auth/session";
import { run } from "@/lib/actions";
import { ok, type Result } from "@/lib/result";
import {
  checkDeadline, createOfferSchema, offerFormSchema, optionalReasonSchema, reasonSchema, toOfferInput, uuidSchema,
  type OfferFormValues,
} from "./schemas";
import { dateInputToIso } from "@/lib/format";

/* Server Actions = commandes du domaine « offres ». Toute transition de statut passe par une RPC SQL. */

const touch = () => {
  revalidatePath("/mes-offres");
  revalidatePath("/offres");
};

const invalid = (error: { issues: { path: PropertyKey[]; message: string }[] }): Result<never> => {
  const fieldErrors: Record<string, string[]> = {};
  for (const i of error.issues) (fieldErrors[String(i.path[0] ?? "form")] ||= []).push(i.message);
  return failure("VALIDATION", { fieldErrors });
};

async function context() {
  const user = await getCurrentUser();
  if (!user) return null;
  return { user, supabase: await createClient() };
}

async function syncSkills(supabase: Awaited<ReturnType<typeof createClient>>, offerId: string, wanted: number[]) {
  const { data, error } = await supabase.from("offer_skills").select("skill_id").eq("offer_id", offerId);
  if (error) return error;
  const current = new Set((data ?? []).map((r) => r.skill_id as number));
  const next = new Set(wanted);
  const toRemove = [...current].filter((id) => !next.has(id));
  const toAdd = [...next].filter((id) => !current.has(id));
  if (toRemove.length) {
    const { error: e } = await supabase.from("offer_skills").delete().eq("offer_id", offerId).in("skill_id", toRemove);
    if (e) return e;
  }
  if (toAdd.length) {
    const { error: e } = await supabase.from("offer_skills").insert(toAdd.map((skill_id) => ({ offer_id: offerId, skill_id })));
    if (e) return e;
  }
  return null;
}

/** Création d'un brouillon à partir du seul titre ; le reste est complété (autosave) sur la page d'édition. */
export async function createOfferDraft(input: { title: string }): Promise<Result<{ id: string }>> {
  return run("offers.create", async () => {
    const parsed = createOfferSchema.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const ctx = await context();
    if (!ctx) return failure("UNAUTHENTICATED");
    if (ctx.user.casquette !== "porteur") return failure("CASQUETTE_REQUIRED");

    const { data, error } = await ctx.supabase.from("offers").insert({ owner_id: ctx.user.id, title: parsed.data.title }).select("id").single();
    if (error) return fromPostgrest(error);
    touch();
    return ok({ id: data.id as string });
  });
}

/** Enregistre un brouillon (autosave) ou modifie une offre active (date et contrat verrouillés). */
export async function saveOffer(id: string, values: OfferFormValues): Promise<Result<{ updatedAt: string }>> {
  return run("offers.save", async () => {
    if (!uuidSchema.safeParse(id).success) return failure("OFFER_NOT_FOUND");
    const parsed = offerFormSchema.safeParse(values);
    if (!parsed.success) return invalid(parsed.error);
    const ctx = await context();
    if (!ctx) return failure("UNAUTHENTICATED");

    const { data: current, error: readError } = await ctx.supabase.from("offers").select("status").eq("id", id).eq("owner_id", ctx.user.id).maybeSingle();
    if (readError) return fromPostgrest(readError);
    if (!current) return failure("OFFER_NOT_FOUND");
    if (current.status !== "draft" && current.status !== "active") return failure("OFFER_LOCKED");

    const input = toOfferInput(parsed.data);
    const patch: Record<string, unknown> = { ...input };
    if (current.status === "active") {
      delete patch.deadline; // via « Prolonger »
      delete patch.contract_type; // verrouillé (hypothèse §4.6)
    }
    const { data, error } = await ctx.supabase.from("offers").update(patch).eq("id", id).select("updated_at").single();
    if (error) return fromPostgrest(error);

    const skillsError = await syncSkills(ctx.supabase, id, parsed.data.skillIds);
    if (skillsError) return fromPostgrest(skillsError);
    touch();
    return ok({ updatedAt: data.updated_at as string });
  });
}

async function rpc(name: "publish_offer" | "close_offer" | "cancel_offer", args: Record<string, unknown>): Promise<Result<{ status: string }>> {
  const ctx = await context();
  if (!ctx) return failure("UNAUTHENTICATED");
  const { data, error } = await ctx.supabase.rpc(name, args);
  if (error) return fromPostgrest(error);
  touch();
  return ok(data as { status: string });
}

/** UC-1. Les préconditions (casquette, identité, champs, date) sont revalidées côté base. */
export async function publishOffer(id: string): Promise<Result<{ status: string }>> {
  return run("offers.publish", async () => {
    if (!uuidSchema.safeParse(id).success) return failure("OFFER_NOT_FOUND");
    return rpc("publish_offer", { p_offer_id: id });
  });
}

/** UC-2. Irréversible. */
export async function closeOffer(id: string): Promise<Result<{ status: string }>> {
  return run("offers.close", async () => {
    if (!uuidSchema.safeParse(id).success) return failure("OFFER_NOT_FOUND");
    return rpc("close_offer", { p_offer_id: id });
  });
}

export async function cancelOffer(id: string, reason: string): Promise<Result<{ status: string }>> {
  return run("offers.cancel", async () => {
    if (!uuidSchema.safeParse(id).success) return failure("OFFER_NOT_FOUND");
    const r = optionalReasonSchema.safeParse(reason);
    if (!r.success) return invalid(r.error);
    return rpc("cancel_offer", { p_offer_id: id, p_reason: r.data ?? null });
  });
}

export async function extendDeadline(id: string, date: string): Promise<Result<{ status: string }>> {
  return run("offers.extend", async () => {
    if (!uuidSchema.safeParse(id).success) return failure("OFFER_NOT_FOUND");
    const err = checkDeadline(date);
    if (err) return failure("INVALID_DEADLINE", { message: err });
    const ctx = await context();
    if (!ctx) return failure("UNAUTHENTICATED");
    const { data, error } = await ctx.supabase.rpc("extend_offer_deadline", { p_offer_id: id, p_new_deadline: dateInputToIso(date) });
    if (error) return fromPostgrest(error);
    touch();
    return ok(data as { status: string });
  });
}

/** Suppression : brouillons uniquement (RLS + condition status = 'draft'). */
export async function deleteDraft(id: string): Promise<Result<void>> {
  return run("offers.delete", async () => {
    if (!uuidSchema.safeParse(id).success) return failure("OFFER_NOT_FOUND");
    const ctx = await context();
    if (!ctx) return failure("UNAUTHENTICATED");
    const { data, error } = await ctx.supabase.from("offers").delete().eq("id", id).eq("owner_id", ctx.user.id).eq("status", "draft").select("id");
    if (error) return fromPostgrest(error);
    if (!data?.length) return failure("INVALID_STATUS");
    touch();
    return ok(undefined);
  });
}

// ---- UC-4 Modération --------------------------------------------------------
async function moderationRpc(name: "moderate_remove_offer" | "moderate_restore_offer" | "flag_offer", id: string, text: string, arg: string): Promise<Result<unknown>> {
  if (!uuidSchema.safeParse(id).success) return failure("OFFER_NOT_FOUND");
  if (name !== "flag_offer") {
    const r = reasonSchema.safeParse(text);
    if (!r.success) return failure("REASON_REQUIRED");
  }
  const ctx = await context();
  if (!ctx) return failure("UNAUTHENTICATED");
  const { data, error } = await ctx.supabase.rpc(name, { p_offer_id: id, [arg]: text });
  if (error) return fromPostgrest(error);
  touch();
  revalidatePath(`/offres/${id}`);
  return ok(data);
}

export async function moderateRemoveOffer(id: string, reason: string) {
  return run("offers.moderate_remove", () => moderationRpc("moderate_remove_offer", id, reason, "p_reason"));
}
export async function moderateRestoreOffer(id: string, justification: string) {
  return run("offers.moderate_restore", () => moderationRpc("moderate_restore_offer", id, justification, "p_justification"));
}
export async function flagOffer(id: string, note: string) {
  return run("offers.flag", () => moderationRpc("flag_offer", id, note, "p_note"));
}
