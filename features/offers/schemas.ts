import { z } from "zod";
import { m } from "@/lib/messages";
import { CONTRACT_TYPES, type ContractType } from "./types";
import { dateInputToIso } from "@/lib/format";

const MAX_DAYS = 90;

const nonNegativeInt = (max = 999_999_999) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || !v.startsWith("-"), m.validation.budgetNegative)
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= max), m.validation.number);

/** Valide une date YYYY-MM-DD : future, au plus 90 jours (règle serveur identique : publish_offer). */
export function checkDeadline(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return m.validation.number;
  const ts = new Date(dateInputToIso(value)).getTime();
  if (Number.isNaN(ts) || ts <= Date.now()) return m.validation.deadlineFuture;
  if (ts > Date.now() + MAX_DAYS * 86_400_000) return m.validation.deadlineMax;
  return null;
}

/**
 * Schéma unique partagé formulaire ↔ Server Action.
 * Les champs numériques et la date sont des chaînes (valeurs brutes des <input>) ;
 * `toOfferInput` les convertit après validation.
 */
export const offerFormSchema = z
  .object({
    title: z.string().trim().min(3, m.validation.titleMin).max(120, m.validation.titleMax),
    description: z.string().max(5000, m.validation.descriptionMax),
    categoryId: z.string(),
    skillIds: z.array(z.number().int().positive()).max(30),
    budgetMin: nonNegativeInt(),
    budgetMax: nonNegativeInt(),
    durationDays: z
      .string()
      .trim()
      .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 730), m.validation.durationRange),
    contractType: z.string().refine((v) => v === "" || (CONTRACT_TYPES as readonly string[]).includes(v), m.validation.required),
    location: z.string().trim().max(120),
    isRemote: z.boolean(),
    deadline: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.deadline !== "") {
      const err = checkDeadline(v.deadline);
      if (err) ctx.addIssue({ code: "custom", path: ["deadline"], message: err });
    }
    if (v.budgetMin !== "" && v.budgetMax !== "" && /^\d+$/.test(v.budgetMin) && /^\d+$/.test(v.budgetMax) && Number(v.budgetMax) < Number(v.budgetMin)) {
      ctx.addIssue({ code: "custom", path: ["budgetMax"], message: m.validation.budgetRange });
    }
  });

export type OfferFormValues = z.infer<typeof offerFormSchema>;

export const emptyOfferForm: OfferFormValues = {
  title: "", description: "", categoryId: "", skillIds: [], budgetMin: "", budgetMax: "",
  durationDays: "", contractType: "", location: "", isRemote: false, deadline: "",
};

export const createOfferSchema = z.object({ title: offerFormSchema.shape.title });

export function toOfferInput(v: OfferFormValues) {
  const num = (s: string) => (s === "" ? null : Number(s));
  return {
    title: v.title.trim(),
    description: v.description.trim() === "" ? null : v.description.trim(),
    category_id: num(v.categoryId),
    budget_min: num(v.budgetMin),
    budget_max: num(v.budgetMax),
    duration_days: num(v.durationDays),
    contract_type: (v.contractType === "" ? null : v.contractType) as ContractType | null,
    location: v.location.trim() === "" ? null : v.location.trim(),
    is_remote: v.isRemote,
    deadline: v.deadline === "" ? null : dateInputToIso(v.deadline),
  };
}

export const uuidSchema = z.uuid();
export const reasonSchema = z.string().trim().min(5, m.validation.reasonMin).max(1000);
export const optionalReasonSchema = z.string().trim().max(500).optional();

// ---- Recherche (UC-3) : filtres reflétés dans l'URL -------------------------
export type OfferFilters = {
  q?: string;
  category?: number;
  contract?: ContractType;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  remote?: boolean;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export function parseOfferFilters(raw: RawParams): { filters: OfferFilters; errors: string[] } {
  const errors: string[] = [];
  const filters: OfferFilters = { page: 1 };

  const q = first(raw.q);
  if (q) filters.q = q.slice(0, 80);
  const loc = first(raw.loc);
  if (loc) filters.location = loc.slice(0, 80);
  if (first(raw.remote) === "1") filters.remote = true;

  const cat = first(raw.category);
  if (cat && /^\d+$/.test(cat)) filters.category = Number(cat);
  const contract = first(raw.contract);
  if (contract && (CONTRACT_TYPES as readonly string[]).includes(contract)) filters.contract = contract as ContractType;

  for (const [key, target] of [["bmin", "budgetMin"], ["bmax", "budgetMax"]] as const) {
    const v = first(raw[key]);
    if (!v) continue;
    if (v.startsWith("-")) errors.push(m.offers.filters.negativeBudget);
    else if (/^\d{1,9}$/.test(v)) filters[target] = Number(v);
  }
  if (filters.budgetMin != null && filters.budgetMax != null && filters.budgetMin > filters.budgetMax) {
    errors.push(m.offers.filters.invalidRange);
    delete filters.budgetMin;
    delete filters.budgetMax;
  }

  const page = first(raw.page);
  if (page && /^\d+$/.test(page) && Number(page) >= 1 && Number(page) <= 1000) filters.page = Number(page);
  return { filters, errors: [...new Set(errors)] };
}

export function filtersToSearchParams(f: Partial<OfferFilters>, page?: number): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.category) p.set("category", String(f.category));
  if (f.contract) p.set("contract", f.contract);
  if (f.budgetMin != null) p.set("bmin", String(f.budgetMin));
  if (f.budgetMax != null) p.set("bmax", String(f.budgetMax));
  if (f.location) p.set("loc", f.location);
  if (f.remote) p.set("remote", "1");
  if (page && page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}
