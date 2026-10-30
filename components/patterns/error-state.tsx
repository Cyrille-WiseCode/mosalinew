"use client";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/lib/messages";
import { cn } from "@/lib/utils";

/** Erreur avec bouton « Réessayer » (obligatoire en contexte réseau instable). */
export function ErrorState({ title = m.states.errorTitle, text = m.states.errorText, onRetry, className }: { title?: string; text?: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("glass grain grain-soft flex flex-col items-center rounded-lg px-6 py-14 text-center", className)}>
      <span className="mb-3 grid size-10 place-items-center rounded-md bg-destructive-soft text-destructive">
        <TriangleAlert className="size-5" aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          {m.common.retry}
        </Button>
      )}
    </div>
  );
}
