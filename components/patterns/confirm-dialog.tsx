"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FormField, fieldA11y } from "@/components/patterns/form-field";
import { m } from "@/lib/messages";
import type { Failure, Result } from "@/lib/result";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  /** Saisie d'une raison : absente, facultative ou obligatoire (min 5 caractères). */
  reason?: { label: string; required: boolean };
  children?: React.ReactNode;
  /** Exécute l'action. Un échec laisse la boîte ouverte et affiche le message. */
  onConfirm: (reason: string) => Promise<Result<unknown>>;
  onSuccess?: () => void;
  onFailure?: (failure: Failure) => void;
};

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, destructive, reason, children, onConfirm, onSuccess, onFailure }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const submit = () => {
    const trimmed = text.trim();
    if (reason?.required && trimmed.length < 5) return setError(m.validation.reasonMin);
    setError(undefined);
    start(async () => {
      const res = await onConfirm(trimmed);
      if (res.ok) {
        setText("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(res.message);
        onFailure?.(res);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!pending) { onOpenChange(v); if (!v) { setError(undefined); setText(""); } } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {reason && (
          <FormField id="confirm-reason" label={reason.label} optional={!reason.required} error={error}>
            <Textarea {...fieldA11y("confirm-reason", error)} value={text} onChange={(e) => setText(e.target.value)} className="min-h-20" />
          </FormField>
        )}
        {!reason && error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>{m.common.cancel}</Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={submit} loading={pending}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
