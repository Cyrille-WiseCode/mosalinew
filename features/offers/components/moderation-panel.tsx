"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Flag, RotateCcw, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/patterns/confirm-dialog";
import { m } from "@/lib/messages";
import { flagOffer, moderateRemoveOffer, moderateRestoreOffer } from "../actions";

type Dlg = "remove" | "flag" | "restore" | null;

/** Panneau réservé aux modérateurs ; « Rétablir » : super_admin uniquement (revalidé en base). */
export function ModerationPanel({ offerId, mode, canRestore }: { offerId: string; mode: "active" | "removed"; canRestore: boolean }) {
  const router = useRouter();
  const [dlg, setDlg] = useState<Dlg>(null);
  const t = m.offers.moderation;
  const done = (msg: string) => () => { toast.success(msg); router.refresh(); };
  return (
    <Card className="p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><ShieldAlert className="size-4 text-warning" aria-hidden="true" />{t.title}</h2>
      <div className="grid gap-2">
        {mode === "active" ? (
          <>
            <Button variant="secondary" onClick={() => setDlg("flag")}><Flag aria-hidden="true" />{t.flag}</Button>
            <Button variant="destructive" onClick={() => setDlg("remove")}><Trash2 aria-hidden="true" />{t.remove}</Button>
          </>
        ) : canRestore ? (
          <Button variant="secondary" onClick={() => setDlg("restore")}><RotateCcw aria-hidden="true" />{t.restore}</Button>
        ) : null}
      </div>
      <ConfirmDialog open={dlg === "remove"} onOpenChange={(o) => setDlg(o ? "remove" : null)} title={t.removeTitle} description={t.removeBody}
        confirmLabel={t.remove} destructive reason={{ label: t.reasonLabel, required: true }}
        onConfirm={(r) => moderateRemoveOffer(offerId, r)} onSuccess={done(m.offers.toasts.removed)} />
      <ConfirmDialog open={dlg === "flag"} onOpenChange={(o) => setDlg(o ? "flag" : null)} title={t.flagTitle}
        confirmLabel={t.flag} reason={{ label: t.flagLabel, required: true }}
        onConfirm={(r) => flagOffer(offerId, r)} onSuccess={done(m.offers.toasts.flagged)} />
      <ConfirmDialog open={dlg === "restore"} onOpenChange={(o) => setDlg(o ? "restore" : null)} title={t.restoreTitle}
        confirmLabel={t.restore} reason={{ label: t.restoreLabel, required: true }}
        onConfirm={(r) => moderateRestoreOffer(offerId, r)} onSuccess={done(m.offers.toasts.restored)} />
    </Card>
  );
}
