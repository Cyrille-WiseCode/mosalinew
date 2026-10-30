import { cn } from "@/lib/utils";

/** Conteneur visuel des filtres (le contenu est fourni par la feature). */
export function FilterBar({ className, children, ...props }: React.ComponentProps<"form">) {
  return (
    <form role="search" className={cn("glass grain grain-soft mb-5 grid gap-3 rounded-lg p-4 sm:grid-cols-2 lg:grid-cols-6", className)} {...props}>
      {children}
    </form>
  );
}
