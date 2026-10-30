import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <Skeleton className="mb-2 h-6 w-48" />
      <Skeleton className="mb-8 h-4 w-80 max-w-full" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-60" />)}
      </div>
    </div>
  );
}
