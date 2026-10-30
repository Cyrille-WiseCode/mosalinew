import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/patterns/empty-state";
import { m } from "@/lib/messages";

export default function NotFound() {
  return (
    <main id="contenu" className="mx-auto grid min-h-screen max-w-lg place-items-center px-4">
      <EmptyState icon={SearchX} title={m.states.notFoundTitle} text={m.states.notFoundText} action={<Link href="/" className={buttonVariants()}>{m.states.goHome}</Link>} />
    </main>
  );
}
