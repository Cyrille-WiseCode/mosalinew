"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { m } from "@/lib/messages";
import { switchCasquette } from "../actions";
import type { Casquette } from "../types";

export function CasquetteSwitcher({ current, className }: { current: Casquette; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const change = (next: Casquette) => {
    if (next === current || pending) return;
    start(async () => {
      const res = await switchCasquette(next);
      if (res.ok) router.refresh();
      else toast.error(res.message);
    });
  };
  return (
    <div role="radiogroup" aria-label={m.casquette.active} className={cn("grid grid-cols-2 gap-0.5 rounded-md border bg-muted p-0.5", className)}>
      {(["freelance", "porteur"] as const).map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={current === c}
          disabled={pending}
          onClick={() => change(c)}
          className={cn(
            "rounded-sm px-2 py-1.5 text-xs font-medium transition-[background-color,color,box-shadow] duration-[160ms]",
            current === c ? "bg-card text-foreground shadow-z1" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {c === "freelance" ? m.casquette.freelance : m.casquette.porteurShort}
        </button>
      ))}
    </div>
  );
}
