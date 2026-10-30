"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/patterns/form-field";
import { filtersToSearchParams } from "@/features/offers/schemas";
import type { Category } from "@/features/offers/types";
import { m } from "@/lib/messages";

const ALL = "all";

/** Recherche du hero : redirige vers /offres (le proxy renvoie vers /login si besoin, filtres conservés). */
export function HeroSearch({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const s = m.landing.search;
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(ALL);
  const [mode, setMode] = useState(ALL);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/offres${filtersToSearchParams({ q: q.trim() || undefined, category: category === ALL ? undefined : Number(category), remote: mode === "remote" })}`);
  };

  return (
    <form onSubmit={submit} role="search" className="glass grain grain-soft mt-9 overflow-hidden rounded-lg bg-card/95 text-foreground shadow-z3">
      <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-[1.5fr_1fr_1fr]">
        <FormField id="hero-q" label={s.query}>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.queryPlaceholder} className="pl-9" maxLength={80} />
          </div>
        </FormField>
        <FormField id="hero-category" label={s.domain}>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="hero-category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{s.allDomains}</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField id="hero-mode" label={s.mode}>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger id="hero-mode"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{s.allModes}</SelectItem>
              <SelectItem value="remote">{s.remote}</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>
      <div className="flex flex-col gap-3 border-t bg-muted/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-success" aria-hidden="true" />{s.verified}</p>
        <Button type="submit" size="lg">{s.cta}<ArrowRight aria-hidden="true" /></Button>
      </div>
    </form>
  );
}
