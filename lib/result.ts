/**
 * Résultat typé des Server Actions et des queries.
 * Règle : aucun `throw` vers l'UI pour les cas prévus (cf. prompt §7).
 */
export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "ACCOUNT_BLOCKED"
  | "FORBIDDEN"
  | "OFFER_NOT_FOUND"
  | "INVALID_STATUS"
  | "INVALID_TRANSITION"
  | "OFFER_LOCKED"
  | "CONTRACT_TYPE_LOCKED"
  | "USE_EXTEND_DEADLINE"
  | "CASQUETTE_REQUIRED"
  | "IDENTITY_REQUIRED"
  | "MISSING_FIELDS"
  | "INVALID_DEADLINE"
  | "REASON_REQUIRED"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_CONFIRMED"
  | "EMAIL_TAKEN"
  | "WEAK_PASSWORD"
  | "RATE_LIMITED"
  | "NETWORK"
  | "UNKNOWN";

export type Failure = {
  ok: false;
  code: ErrorCode;
  message: string;
  /** Erreurs par champ (clé = nom du champ du formulaire). */
  fieldErrors?: Record<string, string[]>;
};
export type Success<T> = { ok: true; data: T };
export type Result<T = void> = Success<T> | Failure;

export const ok = <T>(data: T): Success<T> => ({ ok: true, data });
