export const OFFER_STATUSES = ["draft", "active", "filled", "cancelled", "expired"] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const CONTRACT_TYPES = ["forfait", "regie", "temps_partiel"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];

export type Category = { id: number; slug: string; name: string };
export type Skill = { id: number; slug: string; name: string; categoryId: number | null };

/** Vue publique `offer_cards` (offres actives uniquement). */
export type OfferCardData = {
  id: string;
  title: string;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  durationDays: number | null;
  contractType: ContractType | null;
  location: string | null;
  isRemote: boolean;
  deadline: string | null;
  publishedAt: string | null;
  organizationName: string | null;
  ownerVerified: boolean;
  skills: string[];
  applicationsCount: number;
};

/** Table `offers` vue par son propriétaire (tous statuts). */
export type OwnerOffer = {
  id: string;
  title: string;
  description: string | null;
  categoryId: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
  durationDays: number | null;
  contractType: ContractType | null;
  location: string | null;
  isRemote: boolean;
  deadline: string | null;
  status: OfferStatus;
  publishedAt: string | null;
  closedAt: string | null;
  isModerated: boolean;
  moderationReason: string | null;
  updatedAt: string;
  skillIds: number[];
};

export type OfferSearchResult = { items: OfferCardData[]; total: number; page: number; pageSize: number };
export const PAGE_SIZE = 12;
