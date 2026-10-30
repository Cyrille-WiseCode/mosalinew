"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/patterns/logo";
import { m } from "@/lib/messages";
import { AppSidebar, type NavItem } from "./app-sidebar";
import type { Casquette, IdentityStatus } from "@/features/profiles/types";

type Props = { items: NavItem[]; fullName: string; email: string; casquette: Casquette; identityStatus: IdentityStatus; children: React.ReactNode };

/** Coquille applicative : sidebar fixe ≥ lg, drawer (Sheet) en dessous. */
export function AppShell({ children, ...sidebar }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[236px_1fr]">
      <aside className="glass grain grain-soft sticky top-0 hidden h-screen border-r bg-sidebar/80 lg:block" style={{ position: "sticky" }}>
        <AppSidebar {...sidebar} />
      </aside>
      <div className="min-w-0">
        <header className="glass sticky top-0 z-30 flex h-12 items-center justify-between border-b px-4 lg:hidden">
          <Logo href="/offres" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={m.common.openMenu}><Menu aria-hidden="true" /></Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">{m.common.openMenu}</SheetTitle>
              <SheetDescription className="sr-only">{m.nav.account}</SheetDescription>
              <AppSidebar {...sidebar} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>
        <main id="contenu" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
