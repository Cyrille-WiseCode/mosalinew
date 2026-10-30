import { cn } from "@/lib/utils";

export type Column<T> = { key: string; header: string; className?: string; cell: (row: T) => React.ReactNode };

/** Tableau : bordures légères uniquement, défilement horizontal interne sur mobile. */
export function DataTable<T>({ columns, rows, rowKey, caption }: { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; caption: string }) {
  return (
    <div className="glass grain grain-soft overflow-x-auto rounded-lg">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn("px-4 py-2.5 text-left text-xs font-medium text-muted-foreground", c.className)}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b last:border-b-0 hover:bg-muted/40">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>{c.cell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
