"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/patterns/logo";
import { ThemeToggle } from "@/components/patterns/theme-toggle";
import { m } from "@/lib/messages";
import { cn } from "@/lib/utils";

/** En-tête public. `overlay` : transparent, texte clair, posé sur le hero. */
export function SiteHeader({ loggedIn, overlay = false }: { loggedIn: boolean; overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/#accueil", label: m.nav.home },
    { href: "/#offres", label: m.nav.findMission },
    { href: "/#fonctionnement", label: m.nav.howItWorks },
  ];
  const publishHref = "/mes-offres/nouvelle";
  const accountHref = loggedIn ? "/offres" : "/login";
  const accountLabel = loggedIn ? m.nav.offers : m.nav.login;

  return (
    <header className={cn("z-20 h-16 border-b", overlay ? "absolute inset-x-0 top-0 border-white/15 text-white" : "glass sticky top-0")}>
      <div className="mx-auto flex h-full w-full max-w-[1140px] items-center justify-between px-5 sm:px-6">
        <Logo tone={overlay ? "light" : "default"} />
        <nav aria-label="Navigation principale" className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cn("text-sm font-medium transition-colors", overlay ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground")}>{l.label}</Link>
          ))}
          <Link href={publishHref} className={buttonVariants({ variant: overlay ? "light" : "secondary" })}>{m.nav.publish}</Link>
          <Link href={accountHref} className={buttonVariants()}>{accountLabel}</Link>
          <ThemeToggle variant={overlay ? "light" : "ghost"} />
        </nav>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle variant={overlay ? "light" : "ghost"} />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant={overlay ? "light" : "ghost"} size="icon" aria-label={m.common.openMenu}><Menu aria-hidden="true" /></Button>
            </SheetTrigger>
            <SheetContent className="p-5 text-foreground">
              <SheetTitle className="mb-1 text-sm font-semibold">{m.brand.name}</SheetTitle>
              <SheetDescription className="sr-only">{m.nav.account}</SheetDescription>
              <nav className="mt-4 grid gap-1">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex h-10 items-center rounded-md px-2.5 text-sm font-medium hover:bg-muted">{l.label}</Link>
                ))}
              </nav>
              <div className="mt-5 grid gap-2">
                <Link href={publishHref} onClick={() => setOpen(false)} className={buttonVariants({ variant: "secondary", size: "lg" })}>{m.nav.publish}</Link>
                <Link href={accountHref} onClick={() => setOpen(false)} className={buttonVariants({ size: "lg" })}>{accountLabel}</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
