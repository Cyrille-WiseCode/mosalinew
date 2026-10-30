import { formatBudget, formatXAF } from "@/lib/format";

export function Money({ value }: { value: number }) {
  return <span className="tabular-nums">{formatXAF(value)} FCFA</span>;
}

export function BudgetRange({ min, max }: { min: number | null; max: number | null }) {
  const text = formatBudget(min, max);
  return text ? <span className="tabular-nums">{text}</span> : <span className="text-muted-foreground">—</span>;
}
