import type { AuthError, PostgrestError } from "@supabase/supabase-js";
import type { ErrorCode, Failure } from "@/lib/result";
import { m } from "@/lib/messages";

const RPC_CODES: ErrorCode[] = [
  "UNAUTHENTICATED", "ACCOUNT_BLOCKED", "FORBIDDEN", "OFFER_NOT_FOUND", "INVALID_STATUS", "INVALID_TRANSITION",
  "OFFER_LOCKED", "CONTRACT_TYPE_LOCKED", "USE_EXTEND_DEADLINE", "CASQUETTE_REQUIRED", "IDENTITY_REQUIRED",
  "MISSING_FIELDS", "INVALID_DEADLINE", "REASON_REQUIRED",
];

export function failure(code: ErrorCode, extra?: Partial<Failure>): Failure {
  return { ok: false, code, message: m.errors[code], ...extra };
}

/** Adapter : erreur Postgres/RPC -> échec métier typé (jamais de message technique à l'UI). */
export function fromPostgrest(error: PostgrestError): Failure {
  const code = RPC_CODES.find((c) => error.message?.includes(c));
  if (code === "MISSING_FIELDS") {
    const fields = (error.details ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    return failure(code, { fieldErrors: Object.fromEntries(fields.map((f) => [f, [m.errors.requiredField]])) });
  }
  if (code) return failure(code);
  if (error.code === "42501") return failure("FORBIDDEN"); // RLS
  console.error("[postgrest]", error.code, error.message);
  return failure("UNKNOWN");
}

/** Adapter : erreur Auth Supabase -> échec métier typé. */
export function fromAuth(error: AuthError): Failure {
  if (error.status === 429 || error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit") {
    return failure("RATE_LIMITED");
  }
  switch (error.code) {
    case "invalid_credentials": return failure("INVALID_CREDENTIALS");
    case "email_not_confirmed": return failure("EMAIL_NOT_CONFIRMED");
    case "user_already_exists":
    case "email_exists": return failure("EMAIL_TAKEN");
    case "weak_password": return failure("WEAK_PASSWORD");
    default:
      console.error("[auth]", error.code, error.status);
      return failure("UNKNOWN");
  }
}
