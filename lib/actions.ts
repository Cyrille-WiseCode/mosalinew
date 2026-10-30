import "server-only";
import { failure } from "@/lib/supabase/errors";
import type { Result } from "@/lib/result";

/**
 * Enveloppe des Server Actions : aucune exception ne remonte à l'UI.
 * Les erreurs inattendues sont journalisées avec un identifiant de corrélation
 * (jamais de donnée personnelle dans les logs).
 */
export async function run<T>(scope: string, fn: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await fn();
  } catch (err) {
    const correlationId = crypto.randomUUID().slice(0, 8);
    const name = err instanceof Error ? err.name : "unknown";
    console.error(`[${scope}] cid=${correlationId} error=${name}`);
    const isNetwork = name === "TimeoutError" || name === "AbortError" || (err instanceof TypeError && /fetch/i.test(err.message));
    return failure(isNetwork ? "NETWORK" : "UNKNOWN");
  }
}
