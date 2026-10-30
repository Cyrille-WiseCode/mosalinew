"use client";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { BudgetRange } from "@/components/patterns/money";
import { formatDate, formatDuration } from "@/lib/format";
import { m } from "@/lib/messages";
import type { Failure, Result } from "@/lib/result";
import type { Category, Skill } from "../types";
import { toOfferInput, type OfferFormValues } from "../schemas";

/** Récapitulatif avant publication (UC-1, étape 5). */
export function PublishDialog({ open, onOpenChange, values, categories, skills, onConfirm, onSuccess, onFailure }: {
  open: boolean; onOpenChange: (o: boolean) => void; values: OfferFormValues; categories: Category[]; skills: Skill[];
  onConfirm: () => Promise<Result<unknown>>; onSuccess: () => void; onFailure: (f: Failure) => void;
}) {
  const input = toOfferInput(values);
  const category = categories.find((c) => c.id === input.category_id)?.name;
  const chosen = skills.filter((s) => values.skillIds.includes(s.id)).map((s) => s.name);
  const rows: [string, React.ReactNode][] = [
    [m.offers.form.fields.title, input.title],
    [m.offers.form.fields.category, category ?? "—"],
    [m.offers.detail.budget, <BudgetRange key="b" min={input.budget_min} max={input.budget_max} />],
    [m.offers.detail.duration, formatDuration(input.duration_days) ?? "—"],
    [m.offers.detail.contract, input.contract_type ? m.contract[input.contract_type] : "—"],
    [m.offers.detail.deadline, formatDate(input.deadline)],
    [m.offers.detail.skills, chosen.join(", ") || "—"],
  ];
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={m.offers.publishDialog.title}
      description={m.offers.publishDialog.lead}
      confirmLabel={m.offers.publishDialog.confirm}
      onConfirm={onConfirm}
      onSuccess={onSuccess}
      onFailure={onFailure}
    >
      <dl className="grid gap-2 rounded-md border bg-muted/40 p-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[110px_1fr] gap-2">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </ConfirmDialog>
  );
}
