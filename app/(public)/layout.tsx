import { SiteHeader } from "@/features/landing/components/site-header";
import { SiteFooter } from "@/features/landing/components/site-footer";
import { getCurrentUser } from "@/lib/auth/session";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);
  return (
    <>
      <SiteHeader loggedIn={!!user} />
      <main id="contenu" className="mx-auto w-full max-w-[1140px] px-5 py-8 sm:px-6">{children}</main>
      <SiteFooter />
    </>
  );
}
