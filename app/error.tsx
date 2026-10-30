"use client";
import { ErrorState } from "@/components/patterns/error-state";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="contenu" className="mx-auto grid min-h-screen max-w-lg place-items-center px-4">
      <ErrorState onRetry={reset} />
    </main>
  );
}
