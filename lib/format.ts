const TZ = "Africa/Brazzaville";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** XAF sans décimales, séparateur d'espace insécable : « 900 000 ». */
export function formatXAF(value: number): string {
  return nf.format(value).replace(/\u202f|\u00a0/g, "\u00a0");
}

export function formatBudget(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${formatXAF(min)} – ${formatXAF(max)} FCFA`;
  return `${formatXAF((min ?? max) as number)} FCFA`;
}

export function formatDuration(days: number | null): string | null {
  if (!days) return null;
  if (days % 7 === 0) {
    const w = days / 7;
    return `${w} semaine${w > 1 ? "s" : ""}`;
  }
  return `${days} jour${days > 1 ? "s" : ""}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: TZ }).format(new Date(iso));
}

export function formatRelativeDays(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });
  return rtf.format(diff, "day");
}

/** Valeur d'un <input type="date"> (YYYY-MM-DD) depuis un ISO, fuseau Brazzaville. */
export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(new Date(iso));
}

/** Fin de journée à Brazzaville (UTC+1, sans DST) pour une date YYYY-MM-DD. */
export function dateInputToIso(value: string): string {
  return new Date(`${value}T23:59:59+01:00`).toISOString();
}
