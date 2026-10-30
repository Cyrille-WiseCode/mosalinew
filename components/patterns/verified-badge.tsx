import { Check, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { m } from "@/lib/messages";

export function VerifiedBadge() {
  return (
    <Badge tone="success">
      <Check aria-hidden="true" />
      {m.verifiedLabel}
    </Badge>
  );
}

export function VerifiedMark({ className }: { className?: string }) {
  return <ShieldCheck className={className ?? "size-3.5 text-success"} aria-label={m.verifiedOrg} role="img" />;
}
