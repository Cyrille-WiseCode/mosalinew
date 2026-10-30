"use client";
import { cn } from "@/lib/utils";
import type { Skill } from "../types";

/** Sélecteur multiple de compétences (puces à bascule, accessible au clavier). */
export function SkillPicker({ skills, value, onChange, disabled, invalid }: { skills: Skill[]; value: number[]; onChange: (v: number[]) => void; disabled?: boolean; invalid?: boolean }) {
  const toggle = (id: number) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <div role="group" aria-label="Compétences" className={cn("flex flex-wrap gap-1.5 rounded-md border border-transparent", invalid && "border-destructive/40 p-2")}>
      {skills.map((s) => {
        const on = value.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            onClick={() => toggle(s.id)}
            className={cn(
              "grain grain-soft rounded-sm border px-2 py-1 text-xs font-medium transition-[background-color,border-color,transform] duration-[160ms] ease-[var(--ease-spring)] active:scale-95 disabled:opacity-60",
              on ? "border-primary/40 bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            {s.name}
          </button>
        );
      })}
    </div>
  );
}
