import { AppShell } from "@/components/layout/app-shell";
import type { NavItem } from "@/components/layout/app-sidebar";
import { requireUser } from "@/lib/auth/session";
import { m } from "@/lib/messages";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items: NavItem[] = [
    { href: "/offres", label: m.nav.offers, icon: "search" },
    ...(user.casquette === "porteur" ? [{ href: "/mes-offres", label: m.nav.myOffers, icon: "briefcase" as const }] : []),
    ...(user.identityStatus !== "approved" ? [{ href: "/verification", label: m.nav.verification, icon: "shield" as const }] : []),
  ];
  return (
    <AppShell items={items} fullName={user.fullName} email={user.email} casquette={user.casquette} identityStatus={user.identityStatus}>
      {children}
    </AppShell>
  );
}
