"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LogOut, Search, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/patterns/logo";
import { ThemeToggle } from "@/components/patterns/theme-toggle";
import { StatusBadge } from "@/components/patterns/status-badge";
import { CasquetteSwitcher } from "@/features/profiles/components/casquette-switcher";
import { logoutAction } from "@/features/auth/actions";
import type { Casquette, IdentityStatus } from "@/features/profiles/types";
import { cn } from "@/lib/utils";
import { m } from "@/lib/messages";

const ICONS = { search: Search, briefcase: Briefcase, shield: ShieldCheck } as const;
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

export function AppSidebar({ items, fullName, email, casquette, identityStatus, onNavigate }: {
  items: NavItem[]; fullName: string; email: string; casquette: Casquette; identityStatus: IdentityStatus; onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col gap-5 p-4">
      <div className="px-1.5 pt-1"><Logo href="/offres" /></div>

      <div className="grid gap-1.5">
        <p className="px-1.5 text-2xs font-medium text-muted-foreground">{m.casquette.active}</p>
        <CasquetteSwitcher current={casquette} />
      </div>

      <nav aria-label="Navigation principale" className="grid gap-0.5">
        {items.map(({ href, label, icon }) => {
          const Icon = ICONS[icon];
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-[160ms] md:h-8",
                active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto grid gap-3 border-t pt-4">
        <div className="min-w-0 px-1.5">
          <p className="truncate text-sm font-medium">{fullName || email}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
          <div className="mt-1.5"><StatusBadge kind="identity" status={identityStatus} /></div>
        </div>
        <div className="flex items-center gap-1.5">
          <form action={logoutAction} className="flex-1">
            <button type="submit" className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:h-8">
              <LogOut className="size-4" aria-hidden="true" />{m.nav.logout}
            </button>
          </form>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
