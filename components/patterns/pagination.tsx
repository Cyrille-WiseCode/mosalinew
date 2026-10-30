import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { m } from "@/lib/messages";
import { cn } from "@/lib/utils";

/** Pagination serveur : liens simples (URL partageable, retour arrière correct). */
export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (p: number) => string }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between">
      <p className="text-xs text-muted-foreground">{m.common.page(page, totalPages)}</p>
      <div className="flex gap-2">
        <Link aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : 0} href={hrefFor(Math.max(1, page - 1))} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), page <= 1 && "pointer-events-none opacity-50")}>
          <ChevronLeft aria-hidden="true" />{m.common.previous}
        </Link>
        <Link aria-disabled={page >= totalPages} tabIndex={page >= totalPages ? -1 : 0} href={hrefFor(Math.min(totalPages, page + 1))} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), page >= totalPages && "pointer-events-none opacity-50")}>
          {m.common.next}<ChevronRight aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
