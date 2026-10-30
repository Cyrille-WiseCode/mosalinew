"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FilterBar } from "@/components/patterns/filter-bar";
import { FormField } from "@/components/patterns/form-field";
import { m } from "@/lib/messages";
import { CONTRACT_TYPES, type Category } from "../types";
import { filtersToSearchParams, type OfferFilters } from "../schemas";

const ALL = "all";

export function OfferFilters({ categories, initial }: { categories: Category[]; initial: OfferFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initial.q ?? "");
  const [category, setCategory] = useState(initial.category ? String(initial.category) : ALL);
  const [contract, setContract] = useState(initial.contract ?? ALL);
  const [bmin, setBmin] = useState(initial.budgetMin != null ? String(initial.budgetMin) : "");
  const [bmax, setBmax] = useState(initial.budgetMax != null ? String(initial.budgetMax) : "");
  const [loc, setLoc] = useState(initial.location ?? "");
  const [remote, setRemote] = useState(initial.remote ?? false);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = filtersToSearchParams({
      q: q.trim() || undefined,
      category: category === ALL ? undefined : Number(category),
      contract: contract === ALL ? undefined : (contract as OfferFilters["contract"]),
      // les valeurs négatives sont transmises telles quelles : le serveur affiche l'erreur et les ignore
      budgetMin: bmin === "" ? undefined : Number(bmin),
      budgetMax: bmax === "" ? undefined : Number(bmax),
      location: loc.trim() || undefined,
      remote,
    });
    router.push(`${pathname}${qs}`);
  };
  const reset = () => {
    setQ(""); setCategory(ALL); setContract(ALL); setBmin(""); setBmax(""); setLoc(""); setRemote(false);
    router.push(pathname);
  };

  return (
    <FilterBar onSubmit={apply}>
      <FormField id="f-q" label={m.offers.filters.q} className="sm:col-span-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="f-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={m.offers.filters.qPlaceholder} className="pl-9" maxLength={80} />
        </div>
      </FormField>
      <FormField id="f-category" label={m.offers.filters.category}>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="f-category"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{m.offers.filters.allCategories}</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </FormField>
      <FormField id="f-contract" label={m.offers.filters.contract}>
        <Select value={contract} onValueChange={setContract}>
          <SelectTrigger id="f-contract"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{m.offers.filters.allContracts}</SelectItem>
            {CONTRACT_TYPES.map((c) => <SelectItem key={c} value={c}>{m.contract[c]}</SelectItem>)}
          </SelectContent>
        </Select>
      </FormField>
      <FormField id="f-bmin" label={m.offers.filters.budgetMin}>
        <Input id="f-bmin" type="number" inputMode="numeric" value={bmin} onChange={(e) => setBmin(e.target.value)} placeholder="0" />
      </FormField>
      <FormField id="f-bmax" label={m.offers.filters.budgetMax}>
        <Input id="f-bmax" type="number" inputMode="numeric" value={bmax} onChange={(e) => setBmax(e.target.value)} />
      </FormField>
      <FormField id="f-loc" label={m.offers.filters.location} className="sm:col-span-2">
        <Input id="f-loc" value={loc} onChange={(e) => setLoc(e.target.value)} placeholder={m.offers.filters.locationPlaceholder} maxLength={80} />
      </FormField>
      <div className="flex items-center gap-2 self-end pb-2">
        <Switch id="f-remote" checked={remote} onCheckedChange={setRemote} />
        <Label htmlFor="f-remote">{m.offers.filters.remoteOnly}</Label>
      </div>
      <div className="flex items-end justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={reset}>{m.common.reset}</Button>
        <Button type="submit">{m.offers.filters.apply}</Button>
      </div>
    </FilterBar>
  );
}
