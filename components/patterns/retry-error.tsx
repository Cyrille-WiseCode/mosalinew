"use client";
import { useRouter } from "next/navigation";
import { ErrorState } from "./error-state";

/** ErrorState pour Server Components : « Réessayer » relance le rendu serveur. */
export function RetryError(props: { title?: string; text?: string }) {
  const router = useRouter();
  return <ErrorState {...props} onRetry={() => router.refresh()} />;
}
