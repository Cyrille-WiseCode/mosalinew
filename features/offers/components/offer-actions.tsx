"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarPlus, CheckCheck, ExternalLink, Pencil, Trash2, XCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { FormField, fieldA11y } from "@/components/patterns/form-field";
import { isoToDateInput } from "@/lib/format";
import { m } from "@/lib/messages";
import { cancelOffer, closeOffer, deleteDraft, extendDeadline } from "../actions";
import type { OfferStatus } from "../types";

type Props = {
  offer: { id: string; title: string; status: OfferStatus; deadline: string | null };
  pendingCount: number;
  /** « row » : liste (liens d'édition) ; « full » : en-tête de la page d'édition. */
  variant?: "row" | "full";
  onDeleted?: string;
};

type Dlg = "close" | "cancel" | "delete" | "extend" | null;

export function OfferActions({ offer, pendingCount, variant = "row", onDeleted }: Props) {
  const router = useRouter();
  const [dlg, setDlg] = useState<Dlg>(null);
  const done = (message: string, redirect?: string) => () => {
    toast.success(message);
    if (redirect) router.push(redirect);
    router.refresh();
  };
  const compact = variant === "row";

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {offer.status === "draft" && (
          <>
            {compact && <Link href={`/mes-offres/${offer.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}><Pencil aria-hidden="true" />{m.offers.actions.edit}</Link>}
            <Button size="sm" variant="ghost" onClick={() => setDlg("delete")}><Trash2 aria-hidden="true" />{m.offers.actions.delete}</Button>
          </>
        )}
        {offer.status === "active" && (
          <>
            {compact && <Link href={`/mes-offres/${offer.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}><Pencil aria-hidden="true" />{m.offers.actions.edit}</Link>}
            <Link href={`/offres/${offer.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}><ExternalLink aria-hidden="true" />{m.offers.actions.view}</Link>
            <Button size="sm" variant="ghost" onClick={() => setDlg("extend")}><CalendarPlus aria-hidden="true" />{m.offers.actions.extend}</Button>
            <Button size="sm" variant="ghost" onClick={() => setDlg("close")}><CheckCheck aria-hidden="true" />{m.offers.actions.close}</Button>
            <Button size="sm" variant="ghost" onClick={() => setDlg("cancel")}><XCircle aria-hidden="true" />{m.offers.actions.cancel}</Button>
          </>
        )}
      </div>

      <ConfirmDialog
        open={dlg === "close"} onOpenChange={(o) => setDlg(o ? "close" : null)}
        title={m.offers.closeDialog.title} description={m.offers.closeDialog.body(pendingCount)}
        confirmLabel={m.offers.closeDialog.confirm} destructive
        onConfirm={() => closeOffer(offer.id)} onSuccess={done(m.offers.toasts.closed)}
      />
      <ConfirmDialog
        open={dlg === "cancel"} onOpenChange={(o) => setDlg(o ? "cancel" : null)}
        title={m.offers.cancelDialog.title} description={m.offers.cancelDialog.body}
        confirmLabel={m.offers.cancelDialog.confirm} destructive reason={{ label: m.offers.cancelDialog.reasonLabel, required: false }}
        onConfirm={(reason) => cancelOffer(offer.id, reason)} onSuccess={done(m.offers.toasts.cancelled)}
      />
      <ConfirmDialog
        open={dlg === "delete"} onOpenChange={(o) => setDlg(o ? "delete" : null)}
        title={m.offers.deleteDialog.title} description={m.offers.deleteDialog.body}
        confirmLabel={m.offers.deleteDialog.confirm} destructive
        onConfirm={() => deleteDraft(offer.id)} onSuccess={done(m.offers.toasts.deleted, onDeleted)}
      />
      <ExtendDialog open={dlg === "extend"} onOpenChange={(o) => setDlg(o ? "extend" : null)} offerId={offer.id} current={offer.deadline} onDone={done(m.offers.toasts.extended)} />
    </>
  );
}

function ExtendDialog({ open, onOpenChange, offerId, current, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; offerId: string; current: string | null; onDone: () => void }) {
  const [date, setDate] = useState(isoToDateInput(current));
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const submit = () =>
    start(async () => {
      setError(undefined);
      const res = await extendDeadline(offerId, date);
      if (res.ok) { onOpenChange(false); onDone(); } else setError(res.message);
    });
  return (
    <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.offers.extendDialog.title}</DialogTitle>
          <DialogDescription>{m.offers.form.fields.deadlineHint}</DialogDescription>
        </DialogHeader>
        <FormField id="extend-date" label={m.offers.extendDialog.label} error={error}>
          <Input {...fieldA11y("extend-date", error)} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormField>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>{m.common.cancel}</Button>
          <Button onClick={submit} loading={pending} disabled={!date}>{m.offers.extendDialog.confirm}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
