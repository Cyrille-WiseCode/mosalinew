import { Badge } from "@/components/ui/badge";
import { m } from "@/lib/messages";
import type { OfferStatus } from "@/features/offers/types";
import type { IdentityStatus } from "@/features/profiles/types";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

// Strategy : table statut -> présentation. Ajouter un statut = une ligne.
const OFFER_TONES: Record<OfferStatus, Tone> = { draft: "neutral", active: "success", filled: "info", cancelled: "danger", expired: "warning" };
const IDENTITY_TONES: Record<IdentityStatus, Tone> = { none: "neutral", pending: "warning", approved: "success", rejected: "danger" };

export function StatusBadge({ kind, status }: { kind: "offer"; status: OfferStatus } | { kind: "identity"; status: IdentityStatus }) {
  if (kind === "offer") return <Badge tone={OFFER_TONES[status as OfferStatus]}>{m.offerStatus[status as OfferStatus]}</Badge>;
  return <Badge tone={IDENTITY_TONES[status as IdentityStatus]}>{m.identityStatus[status as IdentityStatus]}</Badge>;
}
