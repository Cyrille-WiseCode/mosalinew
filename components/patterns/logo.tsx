import Link from "next/link";
import { m } from "@/lib/messages";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className, tone = "default" }: { href?: string; className?: string; tone?: "default" | "light" }) {
  return (
    <Link href={href} aria-label={`${m.brand.name}, ${m.nav.home}`} className={cn("inline-flex items-center gap-2.5 font-semibold tracking-[0.08em]", tone === "light" ? "text-white" : "text-foreground", className)}>
      <span className="grain grain-strong grid size-7 place-items-center rounded-md bg-primary text-xs text-primary-foreground shadow-z1">M</span>
      <span className="text-sm">{m.brand.name}</span>
    </Link>
  );
}
